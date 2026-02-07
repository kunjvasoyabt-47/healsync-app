import { prisma } from "../config/db";

export const fulfillOrderService = async (stripeSessionId: string, appointmentId: string) => {
  // Use a transaction to ensure database integrity
  return await prisma.$transaction(async (tx) => {
    // 1. Update Appointment Status to PAID
    const updatedAppointment = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "PAID" }, // Uses your ApptStatus Enum
    });

    // 2. Update Payment Record to SUCCEEDED
    await tx.payment.update({
      where: { stripeSessionId: stripeSessionId },
      data: { 
        status: "SUCCEEDED", // Uses your PaymentStatus Enum
        paidAt: new Date()
      },
    });

    return updatedAppointment;
  });
};
export const cancelExpiredOrderService = async (appointmentId: string) => {
  return await prisma.$transaction([
    // Mark appointment as REJECTED or PENDING so others can book
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "REJECTED" }, // Or back to PENDING if you want
    }),
    // Mark payment as FAILED
    prisma.payment.update({
      where: { appointmentId: appointmentId },
      data: { status: "FAILED" },
    }),
  ]);
};