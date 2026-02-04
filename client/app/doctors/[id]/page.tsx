import DoctorDetailClient from "./DoctorDetailClient";
import api from "../../../src/lib/axios";
import { Doctor } from "../../../src/interfaces/doctor.interface";
import { DOCTOR_ROUTES } from "../../../src/routes/routes";

type Params = Promise<{ id: string }>;

export default async function DoctorDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  let doctor: Doctor | null = null;

  try {
    // Fetch data on the server
    const res = await api.get(DOCTOR_ROUTES.GET_BY_ID(id));
    doctor = res.data;
  } catch (err) {
    console.error("Error fetching doctor on server:", err);
  }

  if (!doctor) {
    return <div className="p-10 text-center text-text-muted font-bold">Doctor not found.</div>;
  }

  // Pass the pre-fetched doctor data to the Client Component
  return <DoctorDetailClient doctor={doctor} doctorId={id} />;
}