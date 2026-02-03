"use client";

import { useState } from "react";
import { Appointment } from "../../src/interfaces/appointment.interface";


export default function MyAppointmentsClient({ initialData }: { initialData: Appointment[] }) {
  const [appointments] = useState(initialData);

  const getStatusStyle = (status: string) => {
    switch (status) {
    case "APPROVED_UNPAID":
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200"; // 🟢 Soft Green
    case "PAID":
      return "bg-emerald-500 text-white border-emerald-600"; // 💹 Vibrant Green
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";  // 🟡 Yellow/Amber
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";     // 🔴 Red
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";   // ⚪ Gray
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-bg-card p-12 rounded-[2.5rem] border-2 border-dashed border-border-main text-center">
        <p className="text-text-muted font-medium">You haven not booked any appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {appointments.map((appt) => (
        <div 
          key={appt.id} 
          className="bg-bg-card p-6 rounded-[2rem] border border-border-main shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-hover hover:shadow-md"
        >
          <div className="flex items-center gap-5 w-full">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-bold">
              {appt.doctor.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main">{appt.doctor.name}</h3>
              <p className="text-primary text-xs font-bold uppercase tracking-wider">
                {appt.doctor.specialization}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <p className="text-sm font-bold text-text-main">
                {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs font-medium text-text-muted">{appt.timeSlot}</p>
            </div>
            <span className={`px-5 py-2 rounded-xl text-xs font-black border ${getStatusStyle(appt.status)}`}>
              {appt.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}