"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";
import MyAppointmentsClient from "./MyAppointmentsClient";
import { Navbar } from "../../src/components/ui/Navbar";
import api from "../../src/lib/axios";

export default function MyAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated as patient
    if (!authLoading && (!user || user.role !== "PATIENT")) {
      router.replace("/login");
      return;
    }

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const response = await api.get("/appointments/patient-list");
        setAppointments(response.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "PATIENT") {
      fetchAppointments();
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or fetching data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-body">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-500 font-medium">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-bg-body">
        <Navbar />
        <div className="max-w-5xl mx-auto py-10 px-6">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Appointments</h2>
            <p className="text-text-muted">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-body">
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-text-main">My Appointments</h1>
          <p className="text-text-muted mt-2">Track and manage your upcoming consultations.</p>
        </header>

        <MyAppointmentsClient initialData={appointments} />
      </main>
    </div>
  );
}