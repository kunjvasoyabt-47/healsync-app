"use client";

import { useState, useEffect } from "react"; // Added useEffect
import api from "../../../src/lib/axios";
import { Appointment } from "@/src/interfaces/appointment.interface";
import { DOCTOR_ROUTES } from "../../../src/routes/routes";

export default function DoctorDashboardClient({ doctorId }: { doctorId: string }) {
  const [activeTab, setActiveTab] = useState<"appointments" | "analysis">("appointments");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- NEW STATE FOR APPOINTMENTS ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);

  // --- FETCH APPOINTMENTS ON MOUNT ---
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/doctors/my-appointments");
        // Accessing .data.data because your controller returns { success: true, data: [...] }
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setFetching(false);
      }
    };
    fetchAppointments();
  }, []);

  // --- HANDLE STATUS UPDATE (Accept/Reject) ---
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
  try {
    await api.patch("/doctors/update-status", { appointmentId, status: newStatus });
    
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentId 
          ? { ...appt, status: newStatus as Appointment["status"] } // 🟢 Cast as any or your specific Status Type
          : appt
      )
    );
  } catch (err) {
    alert("Failed to update status");
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
    } catch (err) {
      alert("Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Badge Colors
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
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md"
          >
            + Create New Slot
          </button>
        </div>

        {/* --- TABS --- */}
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

        {/* --- CONTENT --- */}
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
                      <th className="pb-4">Date & Time</th>
                      <th className="pb-4">Status</th>
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
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${getStatusColor(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                      <td className="py-4 text-right">
                        {appt.status === "PENDING" && (
                          <div className="flex justify-end gap-3">
                            {/* --- ACCEPT BUTTON (Matching your image) --- */}
                            <button 
                              onClick={() => handleUpdateStatus(appt.id, "APPROVED_UNPAID")}
                              className="px-6 py-2 bg-[#1A7A7F] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                              Accept
                            </button>

                            {/* --- REJECT BUTTON --- */}
                            <button 
                              onClick={() => handleUpdateStatus(appt.id, "REJECTED")}
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
            <p className="text-text-muted">Analysis charts will appear here.</p>
          )}
        </div>
      </div>

      {/* --- CREATE SLOT MODAL (Unchanged) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-bg-card w-full max-w-md rounded-3xl p-8 border border-border-main shadow-md">
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