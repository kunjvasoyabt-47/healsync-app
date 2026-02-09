import React from 'react';

export type UserRole = 'PATIENT' | 'DOCTOR';

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  fees: number;
  address?: string;
  bio?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  phone?: string;
}

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

export interface Doctor extends User {
  role: 'DOCTOR';
  doctorProfile: DoctorProfile; 
}

export interface Patient extends User {
  role: 'PATIENT';
  patientProfile: PatientProfile;
}

export interface AuthResponse {
  message: string;
  user: User;
  profile?: DoctorProfile | PatientProfile;
  token?: string; 
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (userData: User, refreshToken: string) => void;
  logout: () => Promise<void>;
}