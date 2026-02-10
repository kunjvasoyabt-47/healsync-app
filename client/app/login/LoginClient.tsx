"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../src/lib/validations/auth";
import type { LoginInput } from "../../src/lib/validations/auth";
import Input from "../../src/components/ui/Input";
import Link from "next/link";
import { useAuth } from "../../src/context/AuthContext";
import api from "../../src/lib/axios";
import { AUTH_ROUTES, PAGE_ROUTES } from "../../src/routes/routes"; 
import { LogIn } from "lucide-react";
import { AxiosError } from "axios";

export default function LoginClient() {
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

 const onSubmit = async (data: LoginInput) => {
  try {
    const res = await api.post(AUTH_ROUTES.LOGIN, data);
    
    const { refreshToken, role, profileId } = res.data;

    if (!refreshToken) {
      throw new Error("No refresh token received");
    }

    // 🟢 Store the refresh token first
    localStorage.setItem('refreshToken', refreshToken);

    // 🟢 Now fetch the full user data
    const userRes = await api.get(AUTH_ROUTES.ME);
    
    // 🟢 Call login with the complete user object
    login(userRes.data.user, refreshToken);
    
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    alert(error.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body px-4">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Log In</h1>
          <p className="text-text-muted mt-1 text-sm">Please sign in to continue to HealSync</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            error={errors.email?.message} 
            {...register("email")} 
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-muted tracking-wider">
              Password
            </label>
            <Input 
              label="" 
              type="password" 
              error={errors.password?.message} 
              {...register("password")} 
            />
            <div className="flex justify-end">
              <Link 
                href={PAGE_ROUTES.FORGOT_PASSWORD} 
                className="text-xs font-bold text-primary hover:underline underline-offset-4 decoration-2 transition-all"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover cursor-pointer text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm shadow-primary/20"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          New to HealSync?{" "}
          <Link href={PAGE_ROUTES.REGISTER} className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}