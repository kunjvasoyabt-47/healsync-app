import { User, DoctorProfile as BaseDoctorProfile } from './auth.interface';
import { Availability } from './availablility.interface';

/**
 * 🟢 We extend the BaseDoctorProfile to add UI-specific fields 
 * like availability, while keeping the required 'id' from Auth.
 */
export interface DoctorProfile extends BaseDoctorProfile {
  city: string;
  // Use 'number | null' because your DB returns null for new profiles
  experience: number | null; 
  // qualifications is already in base as optional, but we can refine it here
  qualifications?: string;
  availability?: Availability[]; 
}

/**
 *  This now correctly extends User because DoctorProfile 
 * inherited the 'id' property from auth.interface.
 */
export interface Doctor extends User {
  role: 'DOCTOR';
  doctorProfile: DoctorProfile; 
}