"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../src/lib/axios";
import { PAGE_ROUTES, AUTH_ROUTES } from "../../src/routes/routes";
import Input from "../../src/components/ui/Input";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AxiosError } from "axios";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordClient() {
  const [isSent, setIsSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setServerError("");
      await api.post(AUTH_ROUTES.FORGET_PASSWORD, data);
      setIsSent(true);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setServerError(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-body px-4">
      <div className="max-w-md w-full bg-bg-card p-8 rounded-2xl shadow-md border border-border-main animate-in fade-in zoom-in duration-300">
        
        <Link
          href={PAGE_ROUTES.LOGIN}
          className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Forgot Password?</h1>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            {isSent
              ? "Check your email for a link to reset your password."
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your registered email"
              error={errors.email?.message}
              {...register("email")}
            />

            {serverError && (
              <p className="text-xs text-danger font-semibold bg-danger/10 p-3 rounded border border-danger/20">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <p className="text-sm text-text-muted mb-4">
              If an account is associated with this email, you will receive instructions shortly.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2"
            >
              Did not receive an email? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}