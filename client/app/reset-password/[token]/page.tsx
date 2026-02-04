import ResetPasswordClient from "./ResetPasswordClient";
import { Metadata } from "next";

// Define Params as a Promise for Next.js 15 compatibility
type Params = Promise<{ token: string }>;

export const metadata: Metadata = {
  title: "Reset Password | HealSync",
  description: "Securely update your HealSync account password.",
};

export default async function ResetPasswordPage(props: { params: Params }) {
  const { token } = await props.params; // Unwrap the promise
  
  return <ResetPasswordClient token={token} />;
}