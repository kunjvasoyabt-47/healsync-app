"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/context/AuthContext"; 
import { Navbar } from "../../src/components/ui/Navbar";
import { DoctorCard } from "../../src/components/ui/DoctorCard";
import { doctorService } from "../../src/services/doctor.service";
import { Doctor } from "../../src/interfaces/doctor.interface";
import { PAGE_ROUTES } from "../../src/routes/routes";

const SPECIALTIES = ["Dentist", "Cardiologist", "Pediatrician", "Neurologist", "Dermatologist", "Gynecologist","Pethology", "ENT Specialist","Diagnostician"];
const CITIES = ["Ahmedabad", "Rajkot", "Surat"];

export default function AllDoctorsPage() {
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState(""); 
  const [loading, setLoading] = useState(true);

  // --- 1. THE SECURITY GUARD ---
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "PATIENT")) {
      router.push(PAGE_ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  // --- 2. DATA FETCHING (With Debounce) ---
  useEffect(() => {
    if (!user || user.role !== "PATIENT") return; 

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await doctorService.getDoctors(search, specialty, city);
        setDoctors(data);
      } catch (err) {
        console.error("Discovery Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400); 
    return () => clearTimeout(timer);
  }, [search, specialty, city, user]); 

  if (authLoading || !user || user.role !== "PATIENT") {
    return null; 
  }

  return (
    <div className="min-h-screen bg-bg-surface">
      <Navbar />
      <main className="max-w-6xl px-6 py-10 mx-auto">
        
        {/* Filters Section */}
        <div className="p-6 mb-10 border bg-bg-card border-border-main rounded-2xl shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by doctor name..."
                className="w-full p-3 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full md:w-64">
              <select
                className="w-full p-3 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-64">
              <select
                className="w-full p-3 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">All Specialities</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            <div className="animate-pulse font-medium text-primary">Updating doctor list...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <DoctorCard 
                  key={doc.id} 
                  doctor={doc} 
                  // Ensure clicking the card leads to the correct dynamic route
                />
              ))
            ) : (
              <div className="py-20 text-center col-span-full">
                <p className="text-xl font-semibold text-text-main">No doctors found</p>
                <p className="text-text-muted">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}