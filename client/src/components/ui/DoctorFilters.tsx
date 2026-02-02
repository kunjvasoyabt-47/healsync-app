"use client";

import { Search, MapPin, Briefcase, X } from "lucide-react";

interface DoctorFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  specialty: string;
  setSpecialty: (val: string) => void;
  cities: string[];
  specialties: string[];
}

export function DoctorFilters({
  search,
  setSearch,
  city,
  setCity,
  specialty,
  setSpecialty,
  cities,
  specialties,
}: DoctorFiltersProps) {
  
  // Helper to reset all filters at once
  const handleClearFilters = () => {
    setSearch("");
    setCity("");
    setSpecialty("");
  };

  const hasActiveFilters = search || city || specialty;

  return (
    <div className="p-6 mb-10 border bg-bg-card border-border-main rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Name Search Input with Icon */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              className="w-full pl-12 pr-4 py-3.5 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-muted/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* City Dropdown with Icon */}
          <div className="w-full md:w-64 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50 group-focus-within:text-primary transition-colors z-10" />
            <select
              className="w-full pl-12 pr-10 py-3.5 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer appearance-none transition-all"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Specialty Dropdown with Icon */}
          <div className="w-full md:w-64 relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50 group-focus-within:text-primary transition-colors z-10" />
            <select
              className="w-full pl-12 pr-10 py-3.5 border rounded-xl border-border-main bg-bg-body text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer appearance-none transition-all"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}