import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import MyAppointmentsClient from "./MyAppointmentsClient";
import { Navbar } from "../../src/components/ui/Navbar";

export default async function MyAppointmentsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  let appointments = [];
  try {
    // 🟢 SSR: Fetching data on the server for SEO and speed
    const response = await axios.get("http://localhost:5000/api/appointments/patient-list", {
      headers: { Cookie: `accessToken=${accessToken}` },
    });
    appointments = response.data;
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    // If token is expired, redirect to login
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg-body">
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-text-main">My Appointments</h1>
          <p className="text-text-muted mt-2">Track and manage your upcoming consultations.</p>
        </header>

        {/* 🟢 CSR: Passing data to the Client Component for interaction */}
        <MyAppointmentsClient initialData={appointments} />
      </main>
    </div>
  );
}