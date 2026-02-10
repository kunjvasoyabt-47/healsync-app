"use client";

import { useAuth } from "../../../src/context/AuthContext";
import DoctorDashboardClient from "./DoctorDashboardClient";

export default function DoctorDashboardPage() {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not a doctor, show access denied
  if (!user || user.role !== "DOCTOR") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-2">You must be logged in as a doctor to view this page.</p>
          <p className="text-sm text-gray-500 mb-6">
            Current status: {user ? `Logged in as ${user.role}` : "Not logged in"}
          </p>
          <a 
            href="/login" 
            className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated as doctor - show dashboard
  return <DoctorDashboardClient doctorId={user.id} />;
}