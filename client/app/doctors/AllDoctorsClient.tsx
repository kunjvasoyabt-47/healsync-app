"use client";

import { useState, useEffect, useRef } from "react"; // 🟢 Added useRef
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/context/AuthContext"; 
import { Navbar } from "../../src/components/ui/Navbar";
import { DoctorCard } from "../../src/components/ui/DoctorCard";
import { DoctorFilters } from "../../src/components/ui/DoctorFilters";
import api from "../../src/lib/axios";
import { Doctor } from "../../src/interfaces/doctor.interface";
import { PAGE_ROUTES, DOCTOR_ROUTES } from "../../src/routes/routes";

const SPECIALTIES = ["Dentist", "Cardiologist", "Pediatrician", "Neurologist", "Dermatologist", "Gynecologist","Pethology", "ENT Specialist","Diagnostician"];
const CITIES = ["Ahmedabad", "Rajkot", "Surat"];

export default function AllDoctorsClient({ initialDoctors }: { initialDoctors: Doctor[] }) {
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState(""); 
  const [city, setCity] = useState(""); 
  const [loading, setLoading] = useState(false);

  // 1. Ref to track the initial mount
  const isInitialMount = useRef(true);

  // 2. Security Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "PATIENT")) {
      router.push(PAGE_ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  // 3. Interactive Filtering & Reset Logic
  useEffect(() => {
    // 🟢 Skip fetch ONLY on the very first load to trust initialDoctors
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        // 🟢 Removing the 'if' guard allows empty params to fetch the full list
        const res = await api.get(DOCTOR_ROUTES.GET_ALL, {
          params: { search, specialty, city }
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Filter Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchFilteredData, 400); 
    return () => clearTimeout(debounceTimer);
  }, [search, specialty, city]); // 🟢 Listens for filter changes AND resets

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-surface">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.role !== "PATIENT") return null;

  return (
    <div className="min-h-screen bg-bg-surface">
      <Navbar />
      <main className="max-w-6xl px-6 py-10 mx-auto">
        <h1 className="text-3xl font-bold text-text-main mb-2">Find Your Doctor</h1>
        <p className="text-text-muted mb-8">Search by specialty, location, or name.</p>

        <DoctorFilters 
          search={search} setSearch={setSearch}
          city={city} setCity={setCity}
          specialty={specialty} setSpecialty={setSpecialty}
          cities={CITIES}
          specialties={SPECIALTIES}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-bg-card border border-border-main rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {doctors.length > 0 ? (
              doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)
            ) : (
              <div className="py-20 text-center col-span-full">
                <p className="text-xl font-semibold text-text-main">No specialists found</p>
                <p className="text-text-muted">Adjust your filters to see more results.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}