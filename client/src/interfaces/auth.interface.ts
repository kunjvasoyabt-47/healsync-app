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
  // Update this line to match your 3-argument function
  login: (userData: User, refreshToken: string) => void;
  logout: () => Promise<void>;
}