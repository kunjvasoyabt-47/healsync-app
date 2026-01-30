"use client";

// 1. ADD 'use' TO YOUR IMPORTS
import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import { TimeSlotPicker } from "../../../src/components/ui/TimeSlotPicker";
import { Navbar } from "../../../src/components/ui/Navbar";
import api from "../../../src/lib/axios";
import { Doctor } from "../../../src/interfaces/doctor.interface";
import axios from "axios";

// 2. DEFINE THE PARAMS TYPE AS A PROMISE
type Params = Promise<{ id: string }>;

export default function DoctorDetailPage(props: { params: Params }) {
  
  // 3. UNWRAP THE PARAMS AT THE TOP OF THE COMPONENT
  const unwrappedParams = use(props.params);
  const doctorId = unwrappedParams.id;

  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<{ date: Date; slot: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      // 4. USE THE UNWRAPPED doctorId HERE
      if (!doctorId) return; 
      
      try {
        const res = await api.get(`/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleBookingData = (date: Date, slot: string) => {
    setSelectedBooking({ date, slot });
  };

  const handleConfirmAppointment = async () => {
    if (!selectedBooking) return alert("Please select a time slot first!");

    setIsSubmitting(true);
    try {
      await api.post("/appointments", {
        doctorId: doctorId, // USE THE UNWRAPPED ID
        date: selectedBooking.date,
        timeSlot: selectedBooking.slot,
      });

      alert("Appointment requested successfully!");
      router.push("/appointments/my-appointments");
    }catch (err: unknown) {
    // Check if the error is actually from Axios
    if (axios.isAxiosError(err)) {
        // TypeScript now knows 'err' has a 'response' property
        const errorMessage = err.response?.data?.error || "Booking failed.";
        alert(errorMessage);
    } else {
        // This handles non-API errors (like a logic crash)
        alert("An unexpected error occurred.");
    }
    }finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Doctor Profile...</div>;
  if (!doctor) return <div className="p-10 text-center">Doctor not found.</div>;

  return (
    <div className="min-h-screen bg-bg-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Profile Card */}
        <div className="p-8 bg-bg-card border border-border-main rounded-3xl shadow-sm mb-10">
            <h1 className="text-3xl font-bold">{doctor.doctorProfile.name}</h1>
            <p className="text-primary font-medium">{doctor.doctorProfile.specialization}</p>
            <p className="text-text-muted mt-2">📍 {doctor.doctorProfile.city}</p>
        </div>

        {/* 5. PASS THE UNWRAPPED ID TO THE PICKER */}
        <TimeSlotPicker 
          doctorId={doctorId} 
          onSlotSelect={handleBookingData} 
        />

        <button 
          onClick={handleConfirmAppointment}
          disabled={isSubmitting || !selectedBooking}
          className={`w-full mt-6 py-4 rounded-xl font-bold transition-all shadow-lg ${
            !selectedBooking || isSubmitting
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-primary text-white hover:opacity-90"
          }`}
        >
          {isSubmitting ? "Processing..." : "Confirm Appointment"}
        </button>
      </main>
    </div>
  );
}