import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DoctorDashboardClient from "./DoctorDashboardClient";
import axios from "axios";

export default async function DoctorDashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  // 1. Declare a variable to hold your user data
  let userData = null;

  try {
    // 2. Use try/catch ONLY for the async logic
    const response = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Cookie: `accessToken=${accessToken}` },
    });
    userData = response.data.user;
  } catch (error) {
    // 3. Handle fetching errors here
    console.error("Dashboard Auth Error:", error);

  }

  // 4. Perform security checks outside the try/catch
  if (!userData || userData.role !== "DOCTOR") {
    redirect("/login");
  }

  // 5. Return the JSX at the top level of the function
  return <DoctorDashboardClient doctorId={userData.id} />;
}