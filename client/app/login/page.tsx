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
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
const onSubmit = async (data: LoginInput) => {
  try {
    const res = await api.post(AUTH_ROUTES.LOGIN, data);
    
    // DEBUG: Check exactly what your backend sends
    console.log("Full Backend Response:", res.data);

    // 1. SAVE THE REFRESH TOKEN (Critical for DB revocation)
    // Adjust based on your backend response (e.g., res.data.refreshToken)
    const token = res.data.refreshToken || res.data.user?.refreshToken;
    if (token) {
      localStorage.setItem("refreshToken", token);
    }

    // 2. Handle Login Redirection
    if (res.data && !res.data.user) {
      login(res.data); 
    } else if (res.data.user) {
      login(res.data.user);
    }
    
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    alert(error.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body px-4">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Log In</h1>
          <p className="text-text-muted mt-1 text-sm">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <Input 
            label="Email Address" 
            type="email" 
            error={errors.email?.message} 
            {...register("email")} 
          />

          {/* Password Field Group */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-muted tracking-wider">
              Password
            </label>
            <Input 
              label="" // Satisfies Required Prop
              type="password" 
              error={errors.password?.message} 
              {...register("password")} 
            />
            {/* Forgot Password Link - Positioned Bottom Right */}
            <div className="flex justify-end">
              <Link 
                href={PAGE_ROUTES.FORGOT_PASSWORD} 
                className="text-xs font-bold text-primary hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover cursor-pointer text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-text-muted">
          New to HealSync?{" "}
          <Link href={PAGE_ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}