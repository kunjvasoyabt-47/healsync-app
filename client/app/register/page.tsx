"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../src/lib/validations/auth";
import type { RegisterInput } from "../../src/lib/validations/auth";
import Input from "../../src/components/ui/Input";
import Link from "next/link";
import api from "../../src/lib/axios";
import { AUTH_ROUTES, PAGE_ROUTES } from "../../src/routes/routes"; 
import { UserPlus } from "lucide-react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    try {
      await api.post(AUTH_ROUTES.REGISTER, data);
      router.push(PAGE_ROUTES.LOGIN); 
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body px-4 py-12">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full Name" error={errors.name?.message} {...register("name")} />
          <Input label="Email Address" type="email" error={errors.email?.message} {...register("email")} />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-text-mutedtracking-wider">I am a...</label>
            <select 
              {...register("role")}
              className={`px-4 py-2.5 rounded-lg border bg-bg-surface outline-none focus:ring-2 transition-all appearance-none
                ${errors.role ? 'border-danger focus:ring-danger/20' : 'border-border-main focus:border-primary focus:ring-primary/20'}`}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
            {errors.role && <span className="text-xs font-medium text-danger mt-1">{errors.role.message}</span>}
          </div>

          {selectedRole === "DOCTOR" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <Input 
                label="Specialization" 
                placeholder="e.g. Cardiologist"
                error={errors.specialization?.message} 
                {...register("specialization")} 
              />
              <Input 
                label="Consultation Fees (₹)" 
                type="number"
                placeholder="500"
                error={errors.fees?.message} 
                {...register("fees", { valueAsNumber: true })} 
              />
            </div>
          )}

          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary pointer hover:bg-primary-hover cursor-pointer text-white font-bold py-3 rounded-lg transition-all shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href={PAGE_ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}