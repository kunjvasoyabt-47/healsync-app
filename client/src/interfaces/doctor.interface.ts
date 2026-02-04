import { User } from './auth.interface';
import { Availability } from './availablility.interface';

export interface DoctorProfile {
  name: string;
  specialization: string;
  city: string;
  fees: number;
  // Use 'number | null' because your DB returns null for new profiles
  experience: number | null; 
  // Use 'string | null' to match your Postman output
  bio: string | null;
  // Optional if not always returned in the 'getAll' list
  address?: string; 
  qualifications?: string;

  availability?: Availability[]; 
}

export interface Doctor extends User {
  // Ensure this matches the nesting in your JSON
  doctorProfile: DoctorProfile; 
}