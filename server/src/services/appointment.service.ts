import { prisma } from "../config/db";
import cloudinary from "../config/cloudinary";
import { ApptStatus } from "@prisma/client";

export const createAppointmentService = async (
  data: {
    doctorUserId: string;
    patientUserId: string;
    date: string;
    timeSlot: string;
    reason?: string;
    symptoms?: string;
  },
  file?: any // Binary file from Multer
) => {
  // 1. Resolve Profiles using User IDs
  const doctorProfile = await prisma.doctorProfile.findUnique({ 
    where: { userId: data.doctorUserId } 
  });
  if (!doctorProfile) throw new Error("DOCTOR_NOT_FOUND");

  const patientProfile = await prisma.patientProfile.findUnique({ 
    where: { userId: data.patientUserId } 
  });
  if (!patientProfile) throw new Error("PATIENT_NOT_FOUND");

  // 2. Upload to Cloudinary using Stream
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

  // 3. Create record in Database
  return await prisma.appointment.create({
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