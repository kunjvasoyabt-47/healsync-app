import ForgotPasswordClient from "./ForgotPasswordClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | HealSync",
  description: "Request a password reset link to regain access to your HealSync account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}