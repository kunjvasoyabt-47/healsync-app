"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DoctorDetailClient from "./DoctorDetailClient";
import api from "../../../src/lib/axios";
import { Doctor } from "../../../src/interfaces/doctor.interface";
import { DOCTOR_ROUTES } from "../../../src/routes/routes";

export default function DoctorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(DOCTOR_ROUTES.GET_BY_ID(id));
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 font-medium">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="p-10 text-center text-text-muted font-bold">
        Doctor not found.
      </div>
    );
  }

  return <DoctorDetailClient doctor={doctor} doctorId={id} />;
}