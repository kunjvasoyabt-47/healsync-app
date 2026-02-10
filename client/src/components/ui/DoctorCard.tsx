import Link from "next/link";
import { Doctor } from "../../interfaces/doctor.interface";

export const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  const profile = doctor.doctorProfile;

  return (
    <div className="flex flex-col justify-between p-5 transition-all border bg-bg-card border-border-main rounded-2xl shadow-sm hover:shadow-md">
      <div>
        <div className="flex items-center justify-center w-16 h-16 mb-4 font-bold rounded-full bg-gray-100 text-primary text-xl">
          {profile?.name ? profile.name[0] : "?"}
        </div>
        
        <h3 className="text-lg font-bold text-text-card-title">{profile?.name}</h3>
        <p className="mb-2 text-sm font-semibold text-primary">{profile?.specialization}</p>
        <p className="text-sm leading-relaxed text-text-muted line-clamp-2">
          {profile?.bio || "Specialist doctor dedicated to providing top-tier healthcare services."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-6 border-t border-border-main">
        <span className="text-lg font-bold text-text-main">₹{profile?.fees}</span>
        <Link href={`/doctors/${doctor.id}`}>
          <button className="px-5 py-2 text-sm font-semibold text-white transition-colors rounded-xl bg-primary hover:bg-primary-hover">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
};