"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/src/context/AuthContext";
import { AuthContextType } from "@/src/interfaces/auth.interface";
import { profileUpdateSchema, ProfileUpdateInput } from "../../../src/lib/validations/auth";
import api from "../../../src/lib/axios";
import { AxiosError } from "axios";
import { User as UserIcon, Phone, MapPin, Save, Loader2, ArrowLeft, DollarSign } from "lucide-react";

export default function EditProfileForm() {
  const router = useRouter();
  const { user, setUser } = useAuth() as AuthContextType;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    // 🟢 Default values to prevent undefined inputs
    defaultValues: {
      name: "",
      phone: "",
      specialization: "",
      fees: 500,
      address: "",
      bio: ""
    }
  });

  // 🟢 Synchronize form with Auth State
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "", 
        phone: user.patientProfile?.phone || "",
        specialization: user.doctorProfile?.specialization || "",
        fees: user.doctorProfile?.fees || 500,
        address: user.doctorProfile?.address || "",
        bio: user.doctorProfile?.bio || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (formData: ProfileUpdateInput) => {
    setLoading(true);
    try {
      const res = await api.patch("/auth/update-profile", formData);
      
      if (setUser && user) {
        // 🟢 Correctly merge the updated profile into the global user state
        const roleKey = user.role === "DOCTOR" ? "doctorProfile" : "patientProfile";
        setUser({ 
          ...user, 
          name: formData.name, // Update the root user name
          [roleKey]: res.data.profile // Update the nested profile data
        });
      }
      
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Profile Update Error:", err);
      const errorMessage = err instanceof Error && "response" in err
          ? (err as AxiosError<{ message: string }>).response?.data?.message
          : "Failed to update profile.";
      alert(errorMessage || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-text-muted">Loading user profile...</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-semibold mb-2 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => console.log("❌ Validation failed:", errors))}
        className="bg-bg-card p-8 rounded-3xl shadow-sm border border-border-main space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-border-main pb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <UserIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-main">Account Settings</h1>
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">
              {user.role} PROFILE
            </p>
          </div>
        </div>

        {/* Name Field (Common for both) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-muted ">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              {...register("name")}
              className={`w-full pl-10 pr-4 py-3 bg-bg-surface border rounded-xl outline-none transition-all ${
                errors.name ? "border-danger ring-1 ring-danger/20" : "border-border-main focus:border-primary"
              }`}
            />
          </div>
          {errors.name && <p className="text-danger text-[10px] font-bold mt-1 ">{errors.name.message}</p>}
        </div>

        {user.role === "DOCTOR" ? (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted ">Specialization</label>
                <input
                  {...register("specialization")}
                  className="w-full p-3 bg-bg-surface border border-border-main rounded-xl focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted ">Consultation Fees (Fixed)</label>
                <div className="relative">
                   <input
                    {...register("fees")}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-main rounded-xl text-text-muted cursor-not-allowed italic"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted ">Clinic Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  {...register("address")}
                  className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-main rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted ">Short Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                className="w-full p-3 bg-bg-surface border border-border-main rounded-xl focus:border-primary outline-none resize-none"
              />
            </div>
          </div>
        ) : (
          /* Patient Only Fields */
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  {...register("phone")}
                  className={`w-full pl-10 pr-4 py-3 bg-bg-surface border rounded-xl outline-none transition-all ${
                    errors.phone ? "border-danger ring-1 ring-danger/20" : "border-border-main focus:border-primary"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-danger text-[10px] font-bold uppercase mt-1">{errors.phone.message}</p>}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}