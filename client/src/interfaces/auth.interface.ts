export type UserRole = 'PATIENT' | 'DOCTOR';

// 🟢 Define specific profile interfaces to ensure consistency
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
  // Use the interfaces defined above
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
}

// 🟢 FIXED: Doctor now correctly extends User because doctorProfile shapes match
export interface Doctor extends User {
  role: 'DOCTOR';
  doctorProfile: DoctorProfile; 
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string; 
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;  loading: boolean;
  login: (userData: User, refreshToken: string) => void;
  logout: () => Promise<void>;
}