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

export default function RegisterClient() {
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
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Join HealSync</h1>
          <p className="text-sm text-text-muted mt-1">Start your healthcare journey today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full Name"  error={errors.name?.message} {...register("name")} />
          <Input label="Email Address" type="email"  error={errors.email?.message} {...register("email")} />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-text-muted">I am a...</label>
            <div className="relative">
              <select 
                {...register("role")}
                className={`w-full px-4 py-3 rounded-xl border bg-bg-surface outline-none focus:ring-2 transition-all appearance-none cursor-pointer
                  ${errors.role ? 'border-danger focus:ring-danger/20' : 'border-border-main focus:border-primary focus:ring-primary/20'}`}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            {errors.role && <span className="text-xs font-medium text-danger mt-1">{errors.role.message}</span>}
          </div>

          {selectedRole === "DOCTOR" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
              <Input 
                label="Specialization" 
                placeholder="e.g. Cardiologist"
                error={errors.specialization?.message} 
                {...register("specialization")} 
              />
              <Input 
                label="Consultation Fees (₹)" 
                type="number"
                error={errors.fees?.message} 
                {...register("fees", { valueAsNumber: true })} 
              />
            </div>
          )}

          <Input label="Password" type="password"  error={errors.password?.message} {...register("password")} />
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href={PAGE_ROUTES.LOGIN} className="text-primary font-bold hover:underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}