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
import { MapPin, Mail, GraduationCap, Briefcase, FileText } from "lucide-react";

export default function DoctorDetailClient({ doctor, doctorId }: { doctor: Doctor, doctorId: string }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 UPDATED: State handles File object instead of string URL
  const [bookingDetails, setBookingDetails] = useState({
    reason: "",
    symptoms: "",
    reportFile: null as File | null
  });

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);

    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`; 

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
    if (!bookingDetails.reason.trim()) return alert("Please provide a reason for your visit.");

    setIsSubmitting(true);
    try {
      // 🟢 STEP: Use FormData for multipart/form-data support
      const formData = new FormData();
      
      // Append standard fields
      formData.append("doctorId", doctorId);
      formData.append("date", selectedDate.toISOString());
      formData.append("timeSlot", selectedSlot);
      formData.append("reason", bookingDetails.reason);
      formData.append("symptoms", bookingDetails.symptoms);

      // Append the file (Key "report" matches backend upload.single("report"))
      if (bookingDetails.reportFile) {
        formData.append("report", bookingDetails.reportFile);
      }

      // 🟢 STEP: Send FormData payload
      await api.post(APPOINTMENT_ROUTES.CREATE, formData);
      
      alert("Appointment requested successfully!");
      router.push(PAGE_ROUTES.MY_APPOINTMENTS);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.error || "Booking failed.";
        if (errorMsg.includes("booked")) {
          alert("This slot was just taken!");
          handleDateSelect(selectedDate!);
        }
      }
    }finally {
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

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-text-muted">
                <GraduationCap className="w-5 h-5 text-primary/70" />
                <span className="text-sm font-medium">{doctor.doctorProfile.qualifications || "MBBS, MD"}</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <Briefcase className="w-5 h-5 text-primary/70" />
                <span className="text-sm font-medium">{doctor.doctorProfile.experience || "8+"} Years Experience</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-main space-y-4">
              <div className="flex items-start gap-3 text-text-muted">
                <MapPin className="w-5 h-5 text-primary/70 mt-0.5 shrink-0" />
                <span className="text-sm font-medium leading-relaxed">
                  {doctor.doctorProfile.address || doctor.doctorProfile.city}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <Mail className="w-5 h-5 text-primary/70 shrink-0" />
                <span className="text-sm font-medium truncate">{doctor.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Date Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full"></span>Step 1: Select a Date
            </h2>
            <BookingCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
          </div>

          {/* Step 2: Slot Selection */}
          {selectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>Step 2: Pick a Time
              </h2>
              <AvailableSlots slots={slots} loading={slotsLoading} selectedSlot={selectedSlot} onSlotSelect={setSelectedSlot} />
            </div>
          )}

          {/* Step 3: Medical Details */}
          {selectedSlot && (
            <div className="bg-bg-card p-8 rounded-3xl border border-border-main shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>Step 3: Medical Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Reason for Visit *</label>
                  <input 
                    type="text"
                    placeholder="e.g., Annual Checkup"
                    className="w-full bg-bg-surface border border-border-main p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={bookingDetails.reason}
                    onChange={(e) => setBookingDetails({...bookingDetails, reason: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Symptoms (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g., Fever, Headache"
                    className="w-full bg-bg-surface border border-border-main p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={bookingDetails.symptoms}
                    onChange={(e) => setBookingDetails({...bookingDetails, symptoms: e.target.value})}
                  />
                </div>
              </div>

              {/* 🟢 UPDATED: File Input for Reports */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1 flex items-center gap-2">
                  <FileText size={14} /> Upload Medical Report (Optional)
                </label>
                <div className="relative group">
                  <input 
                    type="file"
                    accept="image/*,.pdf"
                    className="w-full bg-bg-surface border border-border-main p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    onChange={(e) => setBookingDetails({
                      ...bookingDetails, 
                      reportFile: e.target.files?.[0] || null 
                    })}
                  />
                </div>
                <p className="text-[10px] text-text-muted px-1 italic">* Supported formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>
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