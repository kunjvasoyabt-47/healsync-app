import { cookies } from "next/headers";
import AnalysisClient from "./AnalysisClient";

async function getAnalyticsData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/analytics`, {
    headers: {
      Cookie: `accessToken=${token}`,
    },
    cache: 'no-store' 
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AnalysisPage() {
  const response = await getAnalyticsData();

  if (!response?.success) {
    return (
      <div className="p-8 text-center bg-bg-body">
        <h2 className="text-xl font-bold text-danger">Analysis Unavailable</h2>
        <p className="text-text-muted">Failed to retrieve diagnostic data.</p>
      </div>
    );
  }

  return <AnalysisClient initialData={response.data} />;
}