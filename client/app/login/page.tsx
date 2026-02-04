import LoginClient from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HealSync",
  description: "Securely access your HealSync account to manage appointments and healthcare records.",
};

export default function LoginPage() {
  return <LoginClient />;
}