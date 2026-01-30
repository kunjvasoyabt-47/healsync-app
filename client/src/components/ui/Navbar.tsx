"use client";
import { useAuth } from "@/src/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";


export const Navbar = () => {
  const router = useRouter();
  const {logout} = useAuth(); 
  
  const handleLogout = async () => {
    // Logic: localStorage.removeItem("token");
   await logout();
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-border-main shadow-sm">
      <div className="text-2xl font-bold text-primary">HealSync</div>
      
      <div className="flex items-center gap-8 font-medium text-text-muted">
        <Link href="/doctors" className="hover:text-primary transition-colors">
          View All Doctors
        </Link>
        <Link href="/appointments" className="hover:text-primary transition-colors">
          My Appointments
        </Link>
      <button 
  onClick={handleLogout}
  // Changed bg-red-600 (Dark Red) and text-white (Contrast)
  className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
>
  Logout
</button>
      </div>
    </nav>
  );
};