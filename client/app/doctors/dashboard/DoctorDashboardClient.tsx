"use client";

import { useState, useEffect } from "react";
import api from "../../../src/lib/axios";
import { Appointment } from "@/src/interfaces/appointment.interface";
import Link from "next/dist/client/link";
import AnalysisClient from "../analysis/AnalysisClient";
import { FileText } from "lucide-react"; //  Added for Report Icon

// Extended Interface to include Backend fields
interface AppointmentWithExtras extends Appointment {
  reason?: string;
  reportUrl?: string;
}

interface AnalyticsData {
  totalAppointments: number;
  statusDistribution: Array<{
    status: string;
    _count: { id: number };
  }>;
  dayWise: Record<string, number>;
}

export default function DoctorDashboardClient({ doctorId }: { doctorId: string }) {
  const [activeTab, setActiveTab] = useState<"appointments" | "analysis">("appointments");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [appointments, setAppointments] = useState<AppointmentWithExtras[]>([]);
  const [fetching, setFetching] = useState(true);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false);

  // Fetch Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/doctors/my-appointments");
        //  Backend now sends { success: true, data: [...] }
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setFetching(false);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch Analytics when tab switches
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (activeTab === "analysis" && !analytics) {
        setFetchingAnalytics(true);
        try {
          const res = await api.get("/doctors/analytics");
          setAnalytics(res.data.data);
        } catch (err) {
          console.error("Failed to fetch analytics", err);
        } finally {
          setFetchingAnalytics(false);
        }
      }
    };
    fetchAnalytics();
  }, [activeTab, analytics]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setLoading(true); 
    try {
      const endpoint = newStatus === "APPROVED_UNPAID" 
        ? `/appointments/approve/${appointmentId}` 
        : "/doctors/update-status";
      
      const payload = newStatus === "APPROVED_UNPAID" 
        ? {} 
        : { appointmentId, status: newStatus };

      if (newStatus === "APPROVED_UNPAID") {
        await api.post(endpoint);
      } else {
        await api.patch(endpoint, payload);
      }
      
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId 
            ? { ...appt, status: newStatus as Appointment["status"] } 
            : appt
        )
      );

      if (newStatus === "APPROVED_UNPAID") {
        alert("Appointment approved! The payment link has been sent to the patient.");
      } else if (newStatus === "REJECTED") {
        alert("Appointment has been rejected.");
      }

    } catch (err: unknown) {
      console.error("Status Update Error:", err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    dayOfWeek: 0,
    startTime: "08:00",
    endTime: "11:00",
    slotDuration: 60,
  });

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/availability/${doctorId}/set-schedule`, formData);
      alert("Slot created successfully!");
      setShowModal(false);
    } catch (err: unknown) {
      console.error("Create slot error:", err);
      alert("Failed to create slot");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
  try {
      const refreshToken = localStorage.getItem("refreshToken");

      // 1. Hit your logout controller
      await api.post("/auth/logout", { refreshToken });

      // 2. Clear local storage so interceptor doesn't try to refresh
      localStorage.removeItem("refreshToken");

      // 3. Force redirect to login page
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      // Fallback: Clear local storage and redirect anyway if the API fails
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "APPROVED_UNPAID": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-bg-surface p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-text-main">Doctor Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/profile/edit" 
              className="border border-border-main hover:bg-gray-50 px-6 py-2 rounded-xl font-semibold transition-all"
            >
              Edit Profile
            </Link>

            <button 
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md"
            >
              + Create New Slot
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF2D10] hover:bg-[#e6293f] text-white font-bold rounded-2xl transition-all active:scale-95"
            >
            Logout
          </button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-border-main mb-6">
          {["appointments", "analysis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "appointments" | "analysis")}
              className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-sm min-h-[400px]">
          {activeTab === "appointments" ? (
            fetching ? (
              <p className="text-text-muted">Loading your appointments...</p>
            ) : appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-main">
                      <th className="pb-4">Patient</th>
                      <th className="pb-4">Time</th>
                      <th className="pb-4">Reason</th> 
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-center">Report</th> 
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="text-sm">
                        <td className="py-4 font-semibold text-text-main">{appt.patient?.name || "Unknown"}</td>
                        <td className="py-4 text-text-muted">
                          {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                        </td>
                        {/* Render Meeting Reason */}
                        <td className="py-4 text-text-muted truncate max-w-[150px]">
                          {appt.reason || "General Consultation"}
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusColor(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        {/* Render Report Action Button */}
                        <td className="py-4 text-center">
                          {appt.reportUrl ? (
                            <button 
                              onClick={() => window.open(appt.reportUrl, '_blank')}
                              className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-all"
                              title="View Patient Report"
                            >
                              <FileText size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {appt.status === "PENDING" && (
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => handleUpdateStatus(appt.id, "APPROVED_UNPAID")}
                                disabled={loading}
                                className="px-6 py-2 bg-[#1A7A7F] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                              >
                                {loading ? "..." : "Accept"}
                              </button>

                              <button 
                                onClick={() => handleUpdateStatus(appt.id, "REJECTED")}
                                disabled={loading}
                                className="px-6 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-muted">No appointments found.</p>
            )
          ) : (
            fetchingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-text-muted">Calculating clinical analytics...</p>
              </div>
            ) : analytics ? (
              <AnalysisClient initialData={analytics} />
            ) : (
              <p className="text-text-muted">Failed to load analytics data.</p>
            )
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-bg-card w-full max-w-md rounded-3xl p-8 border border-border-main shadow-sm">
            <h2 className="text-xl font-bold text-text-main mb-6">Set Availability</h2>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Day of Week</label>
                <select 
                  className="w-full p-3 rounded-xl border border-border-main bg-bg-surface"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">Start Time</label>
                  <input type="time" className="w-full p-3 rounded-xl border border-border-main bg-bg-surface" 
                    value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">End Time</label>
                  <input type="time" className="w-full p-3 rounded-xl border border-border-main bg-bg-surface" 
                    value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Slot Duration (Min)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-border-main bg-bg-surface" 
                  value={formData.slotDuration} onChange={(e) => setFormData({...formData, slotDuration: Number(e.target.value)})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-text-muted font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors">
                  {loading ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}