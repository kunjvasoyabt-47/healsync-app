export interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  doctor: {
    name: string;
    specialization: string;
  };
  patient: {
    name: string;
    phone?: string; // Optional fields if you fetch them
  };
}