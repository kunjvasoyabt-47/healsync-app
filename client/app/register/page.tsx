import RegisterClient from "./RegisterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join HealSync | Create Your Account",
  description: "Sign up as a patient or a doctor to start managing appointments and healthcare efficiently.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}