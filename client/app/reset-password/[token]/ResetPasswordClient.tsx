"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import api from "../../../src/lib/axios";
import { PAGE_ROUTES, AUTH_ROUTES } from "../../../src/routes/routes";
import Input from "../../../src/components/ui/Input";
import { ShieldCheck, Lock } from "lucide-react";
import { AxiosError } from "axios";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordClient({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setServerError("");
      await api.patch(AUTH_ROUTES.RESET_PASSWORD, {
        token,
        password: data.password
      });
      setIsSuccess(true);
      setTimeout(() => router.push(PAGE_ROUTES.LOGIN), 3000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setServerError(error.response?.data?.message || "Link invalid or expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body px-4">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main text-center animate-in fade-in zoom-in duration-300">
        
        <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
          {isSuccess ? <ShieldCheck className="w-8 h-8 text-primary" /> : <Lock className="w-8 h-8 text-primary" />}
        </div>

        <h1 className="text-2xl font-bold text-text-main mb-2 tracking-tight">
          {isSuccess ? "Password Updated!" : "Set New Password"}
        </h1>

        {isSuccess ? (
          <div className="space-y-4">
            <p className="text-text-muted leading-relaxed">
              Your password has been reset successfully. Redirecting you to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••"
              error={errors.password?.message} 
              {...register("password")} 
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="••••••••"
              error={errors.confirmPassword?.message} 
              {...register("confirmPassword")} 
            />

            {serverError && (
              <p className="text-xs text-danger font-bold text-center bg-danger/10 p-2 rounded">
                {serverError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}