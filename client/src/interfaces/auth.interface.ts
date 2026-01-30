export type UserRole = 'PATIENT' | 'DOCTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string; // If you decide to use Bearer tokens later
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}