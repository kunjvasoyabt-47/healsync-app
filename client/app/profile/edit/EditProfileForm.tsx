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
  });

  useEffect(() => {
    if (user) {
      const profile = user.role === "DOCTOR" ? user.doctorProfile : user.patientProfile;
      reset({
        name: profile?.name || "",
        phone: user.patientProfile?.phone || "",
        specialization: user.doctorProfile?.specialization || "",
        fees: user.doctorProfile?.fees || 0,
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
        const key = user.role === "DOCTOR" ? "doctorProfile" : "patientProfile";
        setUser({ ...user, [key]: res.data.profile });
      }
      alert("Profile updated successfully!");
    } catch (err: AxiosError<{ message: string }> | unknown) {
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
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-semibold mb-2 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-3xl shadow-sm border border-border-main space-y-6"
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

        {/* Display Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-muted uppercase">Display Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              {...register("name")}
              className={`w-full pl-10 pr-4 py-3 bg-bg-surface border rounded-xl outline-none transition-all ${
                errors.name ? "border-red-500 ring-1 ring-red-500" : "border-border-main"
              }`}
            />
          </div>
          {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
        </div>

        {user.role === "DOCTOR" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialization */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Specialization</label>
                <input
                  {...register("specialization")}
                  className={`w-full p-3 bg-bg-surface border rounded-xl outline-none ${
                    errors.specialization ? "border-red-500" : "border-border-main"
                  }`}
                />
                {errors.specialization && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">{errors.specialization.message}</p>
                )}
              </div>

              {/* Read Only Fees */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Consultation Fees (Fixed)</label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                   <input
                    {...register("fees")}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-border-main rounded-xl outline-none text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Clinic Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  {...register("address")}
                  className={`w-full pl-10 pr-4 py-3 bg-bg-surface border rounded-xl outline-none ${
                    errors.address ? "border-red-500" : "border-border-main"
                  }`}
                />
              </div>
              {errors.address && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.address.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Short Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                className={`w-full p-3 bg-bg-surface border rounded-xl outline-none resize-none ${
                  errors.bio ? "border-red-500" : "border-border-main"
                }`}
              />
              {errors.bio && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.bio.message}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  {...register("phone")}
                  className={`w-full pl-10 pr-4 py-3 bg-bg-surface border rounded-xl outline-none ${
                    errors.phone ? "border-red-500" : "border-border-main"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.phone.message}</p>}
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