  import { prisma } from "../config/db";
  import cloudinary from "../config/cloudinary";
  import { ApptStatus } from "@prisma/client";
  import { stripeService } from "./stripe.service";
  import { sendEmail } from "../utils/email";

  export const createAppointmentService = async (
    data: {
      doctorUserId: string;
      patientUserId: string;
      date: string;
      timeSlot: string;
      reason?: string;
      symptoms?: string;
    },
    file?: any 
  ) => {
    // 1. Resolve Profiles (Keep outside transaction to reduce lock time)
    const doctorProfile = await prisma.doctorProfile.findUnique({ 
      where: { userId: data.doctorUserId } 
    });
    if (!doctorProfile) throw new Error("DOCTOR_NOT_FOUND");

    const patientProfile = await prisma.patientProfile.findUnique({ 
      where: { userId: data.patientUserId } 
    });
    if (!patientProfile) throw new Error("PATIENT_NOT_FOUND");

    // 2. Upload to Cloudinary
    let reportUrl = null;
    if (file) {
      const uploadRes: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "healsync_reports" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer); 
      });
      reportUrl = uploadRes.secure_url;
    }

    // 3. Use a Transaction to prevent Race Conditions
    return await prisma.$transaction(async (tx) => {
      // Check if slot is taken using the unique index
      const existing = await tx.appointment.findUnique({
        where: {
          doctorId_date_timeSlot: {
            doctorId: doctorProfile.id,
            date: new Date(data.date),
            timeSlot: data.timeSlot,
          },
        },
      });

      if (existing) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      return await tx.appointment.create({
        data: {
          doctorId: doctorProfile.id,
          patientId: patientProfile.id,
          date: new Date(data.date),
          timeSlot: data.timeSlot,
          reason: data.reason || "General Consultation",
          symptoms: data.symptoms || null,
          reportUrl: reportUrl,
          status: ApptStatus.PENDING,
        },
      });
    });
  };

  export const getPatientAppointmentsService = async (userId: string) => {
    return await prisma.appointment.findMany({
      where: { patient: { userId: userId } },
      include: {
        doctor: {
          select: { name: true, specialization: true, city: true }
        },
      },
      orderBy: { date: "desc" },
    });
  };

  export const approveAppointmentService = async (appointmentId: string) => {
    // 1. Fetch appointment with full relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { 
        patient: { include: { user: true } }, 
        doctor: true 
      }
    });

    if (!appointment) throw new Error("APPOINTMENT_NOT_FOUND");
    if (!appointment.doctor.fees) throw new Error("DOCTOR_FEES_NOT_SET");

    // 2. Create Stripe Session (Passes email so Stripe can pre-fill it)
    const session = await stripeService.createCheckoutSession(
      appointment.id,
      appointment.doctor.fees,
      appointment.patient.user.email
    );

    // 3. Set 3-hour deadline
    const expiryTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // 4. Atomic Transaction: Update Appointment & Create Payment Record
 // 4. Atomic Transaction: Update Appointment & Create OR Update Payment Record
const result = await prisma.$transaction(async (tx) => {
  const updatedAppt = await tx.appointment.update({
    where: { id: appointmentId },
    data: { status: "APPROVED_UNPAID" }
  });

  // 🟢 CHANGE: Use upsert to prevent "Unique constraint" errors
  await tx.payment.upsert({
    where: { 
      appointmentId: appointment.id 
    },
    update: {
      amount: appointment.doctor.fees,
      stripeSessionId: session.id, // Update with the new Stripe link
      expiresAt: expiryTime,
      status: "PENDING"
    },
    create: {
      amount: appointment.doctor.fees,
      stripeSessionId: session.id,
      expiresAt: expiryTime,
      appointmentId: appointment.id,
      status: "PENDING"
    }
  });

  return { updatedAppt, paymentUrl: session.url };
});

    // 5. Send Email to Patient (Outside transaction so DB isn't locked if email is slow)
    try {
    // Inside approveAppointmentService
  await sendEmail({
    email: appointment.patient.user.email,
    subject: "Appointment Approved - Payment Required",
    message: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #28a745;">Appointment Approved!</h2>
        <p>Dr. ${appointment.doctor.name} has approved your request for <b>${appointment.date.toDateString()}</b>.</p>
        <p>Please pay within 3 hours to confirm your booking:</p>
        <a href="${result.paymentUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Complete Payment
        </a>
      </div>
    `,
  });
    } catch (err) {
      console.error("Email failed but appointment approved:", err);
    }

    return result;
  };

/**
 * Automatically rejects appointments where the 3-hour payment window has expired.
 * This should be called by the node-cron task in index.ts.
 */
export const runAppointmentCleanup = async () => {
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find all pending payments that have passed their expiry time
      const expiredPayments = await tx.payment.findMany({
        where: { 
          status: "PENDING", 
          expiresAt: { lt: now } 
        },
        select: { appointmentId: true, id: true }
      });

      if (expiredPayments.length === 0) return 0;

      const appointmentIds = expiredPayments.map(p => p.appointmentId);
      const paymentIds = expiredPayments.map(p => p.id);

      // 2. Update Appointments to REJECTED in bulk
      await tx.appointment.updateMany({
        where: { id: { in: appointmentIds } },
        data: { status: "REJECTED" }
      });

      // 3. Update Payments to FAILED in bulk
      await tx.payment.updateMany({
        where: { id: { in: paymentIds } },
        data: { status: "FAILED" }
      });

      return expiredPayments.length;
    });

    if (result > 0) {
      console.log(`[${new Date().toISOString()}] 🧹 Cleanup: ${result} appointments expired.`);
    }
  } catch (error) {
    console.error("Critical error during appointment cleanup:", error);
    throw error;
  }
};