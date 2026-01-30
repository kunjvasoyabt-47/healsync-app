import { User } from './auth.interface';
import { Availability } from './availablility.interface';

export interface DoctorProfile {
  name: string;
  specialization: string;
  experience: number;
  city: string;
  fees: number;
  clinicAddress: string;
  bio?: string;
  // Replace any[] with the actual Availability interface
  availability?: Availability[]; 
}

export interface Doctor extends User {
  doctorProfile: DoctorProfile; 
}