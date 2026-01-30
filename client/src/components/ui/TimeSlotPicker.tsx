"use client";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

interface Props {
  doctorId: string;
  onSlotSelect: (date: Date, slot: string) => void;
}

export function TimeSlotPicker({ doctorId, onSlotSelect }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // Fetch slots whenever the selected date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/doctors/${doctorId}/slots`, {
          params: { date: selectedDate }
        });
        setSlots(res.data);
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleSelect = (slot: string) => {
    setActiveSlot(slot);
    onSlotSelect(new Date(selectedDate), slot);
  };

  return (
    <div className="p-6 border bg-bg-card border-border-main rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-text-main mb-4">Select Appointment Time</h3>

      {/* 1. Date Input */}
      <input 
        type="date" 
        value={selectedDate}
        min={new Date().toISOString().split('T')[0]} // Prevents booking in the past
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full p-3 mb-6 border rounded-xl border-border-main bg-bg-body text-text-main outline-none focus:ring-2 focus:ring-primary/20"
      />

      {/* 2. Slots Grid */}
      {loading ? (
        <div className="text-center py-10 animate-pulse text-text-muted">Loading slots...</div>
      ) : slots.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSelect(slot)}
              className={`py-2 px-4 text-sm font-medium rounded-lg border transition-all ${
                activeSlot === slot 
                ? "bg-primary text-white border-primary shadow-md" 
                : "bg-bg-body text-text-main border-border-main hover:border-primary hover:text-primary"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-text-muted bg-bg-surface rounded-xl border border-dashed border-border-main">
          No slots available for this date.
        </div>
      )}
    </div>
  );
}