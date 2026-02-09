import React from 'react';

export type UserRole = 'PATIENT' | 'DOCTOR';

// 🟢 Single source of truth for Doctor Profile
export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  fees: number;
  address?: string;
  bio?: string;
}

// 🟢 Single source of truth for Patient Profile
export interface PatientProfile {
  id: string;
  name: string;
  phone?: string;
}

// 🟢 Base User interface with optional profiles
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
}

// 🟢 Doctor strictly requires doctorProfile
export interface Doctor extends User {
  role: 'DOCTOR';
  doctorProfile: DoctorProfile; 
}

// 🟢 Patient strictly requires patientProfile
export interface Patient extends User {
  role: 'PATIENT';
  patientProfile: PatientProfile;
}

export interface AuthResponse {
  message: string;
  user: User;
  // 🟢 Handles profile updates in EditProfileForm
  profile?: DoctorProfile | PatientProfile; 
  token?: string; 
}

export interface AuthContextType {
  user: User | null;
  // 🟢 Matches React.useState exactly to prevent build errors
  setUser: React.Dispatch<React.SetStateAction<User | null>>; 
  loading: boolean;
  login: (userData: User, refreshToken: string) => void;
  logout: () => Promise<void>;
}