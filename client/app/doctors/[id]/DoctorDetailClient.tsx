"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../src/components/ui/Navbar";
import BookingCalendar from "../../../src/components/ui/BookingCalendar";
import AvailableSlots from "../../../src/components/ui/AvailableSlots";
import api from "../../../src/lib/axios";
import { Doctor } from "../../../src/interfaces/doctor.interface";
import axios from "axios";
import { DOCTOR_ROUTES, APPOINTMENT_ROUTES, PAGE_ROUTES } from "../../../src/routes/routes";

export default function DoctorDetailClient({ doctor, doctorId }: { doctor: Doctor, doctorId: string }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await api.get(DOCTOR_ROUTES.GET_SLOTS(doctorId, dateStr));
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedSlot) return alert("Please select a date and time!");
    setIsSubmitting(true);
    try {
      await api.post(APPOINTMENT_ROUTES.CREATE, {
        doctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
      });
      alert("Appointment requested successfully!");
      router.push(PAGE_ROUTES.MY_APPOINTMENTS);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Booking failed.";
      alert(message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <div className="p-8 bg-bg-card border border-border-main rounded-3xl shadow-sm sticky top-24">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold mb-6">
              {doctor.doctorProfile.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-text-main">{doctor.doctorProfile.name}</h1>
            <p className="text-primary font-semibold text-lg">{doctor.doctorProfile.specialization}</p>
            <div className="mt-6 pt-6 border-t border-border-main space-y-4">
              <div className="flex items-center gap-3 text-text-muted">
                <span className="text-xl">📍</span>
                <span className="text-sm font-medium">{doctor.doctorProfile.city}</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <span className="text-xl">📧</span>
                <span className="text-sm font-medium">{doctor.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full"></span>Step 1: Select a Date
            </h2>
            <BookingCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
          </div>

          {selectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>Step 2: Pick a Time
              </h2>
              <AvailableSlots slots={slots} loading={slotsLoading} selectedSlot={selectedSlot} onSlotSelect={setSelectedSlot} />
            </div>
          )}

          <div className="pt-6">
            <button 
              onClick={handleConfirmAppointment}
              disabled={isSubmitting || !selectedSlot}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-md active:scale-[0.98] ${
                !selectedSlot || isSubmitting ? "bg-gray-200 text-text-muted cursor-not-allowed" : "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
              }`}
            >
              {isSubmitting ? "Processing Request..." : "Confirm My Appointment"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}