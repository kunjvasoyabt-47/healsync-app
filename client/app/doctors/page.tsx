import AllDoctorsClient from "./AllDoctorsClient";
import api from "../../src/lib/axios";
import { Doctor } from "../../src/interfaces/doctor.interface";
import { DOCTOR_ROUTES } from "../../src/routes/routes";
export const dynamic = "force-dynamic";

export default async function AllDoctorsPage() {
  let initialDoctors: Doctor[] = [];

  try {
    // Initial fetch on the server for faster LCP (Largest Contentful Paint)
    const res = await api.get(DOCTOR_ROUTES.GET_ALL);
    initialDoctors = res.data;
  } catch (err) {
    console.error("Server-side fetch error:", err);
  }

  return <AllDoctorsClient initialDoctors={initialDoctors} />;
}