import AllDoctorsClient from "./AllDoctorsClient";
import apiServer from "../../src/lib/axios";  // ← Changed this line
import { Doctor } from "../../src/interfaces/doctor.interface";
import { DOCTOR_ROUTES } from "../../src/routes/routes";
export const dynamic = "force-dynamic";

export default async function AllDoctorsPage() {
  let initialDoctors: Doctor[] = [];

  try {
    const res = await apiServer.get(DOCTOR_ROUTES.GET_ALL);  // ← Changed this line
    initialDoctors = res.data;
  } catch (err) {
    console.error("Server-side fetch error:", err);
  }

  return <AllDoctorsClient initialDoctors={initialDoctors} />;
}