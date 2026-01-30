"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from "../lib/axios";
import { User, AuthContextType } from "../interfaces/auth.interface";
import { PAGE_ROUTES,AUTH_ROUTES } from '../routes/routes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get(AUTH_ROUTES.ME);
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData: User) => {
    if (!userData) return;
    setUser(userData);

    // Immediate role-based routing
    if (userData.role === "PATIENT") {
      router.push(PAGE_ROUTES.DOCTORS);
    } else if (userData.role === "DOCTOR") {
      // router.push(PAGE_ROUTES.DOCTOR_DASHBOARD);
    } else {
      router.push("/");
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      // We send the token to the backend to set 'revoked: true' in DB
      if (refreshToken) {
        await api.post(AUTH_ROUTES.LOGOUT, { refreshToken });
      }
    } catch (e) {
      console.warn("Logout API revocation failed", e);
    } finally {
      // Always clear local state so the user is logged out visually
      setUser(null);
      localStorage.removeItem("refreshToken");
      router.replace(PAGE_ROUTES.LOGIN);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};