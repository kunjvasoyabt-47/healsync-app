"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../src/context/AuthContext";
import { useRouter } from "next/navigation";
import AnalysisClient from "./AnalysisClient";
import api from "../../../src/lib/axios";

interface AnalyticsData {
  totalAppointments: number;
  statusDistribution: Array<{
    status: string;
    _count: { id: number };
  }>;
  dayWise: Record<string, number>;
}

export default function AnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated as doctor
    if (!authLoading && (!user || user.role !== "DOCTOR")) {
      router.replace("/login");
      return;
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/doctors/analytics");
        setAnalytics(res.data.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "DOCTOR") {
      fetchAnalytics();
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !analytics) {
    return (
      <div className="p-8 text-center bg-bg-body min-h-screen flex items-center justify-center">
        <div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Analysis Unavailable</h2>
          <p className="text-text-muted">Failed to retrieve diagnostic data.</p>
        </div>
      </div>
    );
  }

  // Show analytics
  return <AnalysisClient initialData={analytics} />;
}