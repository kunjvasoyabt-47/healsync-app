  "use client";

  import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
  import { useRouter } from 'next/navigation';
  import api from "../lib/axios";
  import { User, AuthContextType } from "../interfaces/auth.interface";
  import { PAGE_ROUTES, AUTH_ROUTES } from '../routes/routes';
  import { AxiosError } from 'axios';


  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const hasChecked = useRef(false);

    const checkAuth = useCallback(async () => {
    if (hasChecked.current) return;

    try {
      setLoading(true);
      const res = await api.get(AUTH_ROUTES.ME);
      
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (error) {
    const err = error as AxiosError;
    // 🟢 Don't log 401s if you expect the interceptor to handle them
  if (err.response?.status !== 401) {
      console.error("Auth verification failed:", err.response?.status);
      setUser(null); 
    }
  } finally {
      setLoading(false);
      hasChecked.current = true;
    }
  }, []); // 🟢 Removed pathname dependency to prevent re-runs on every navigation

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    const login = (userData: User, refreshToken: string) => {
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);

      if (userData.role === "PATIENT") {
        router.push(PAGE_ROUTES.DOCTORS);
      } else {
        router.push(PAGE_ROUTES.DOCTOR_DASHBOARD);
      }
    };

    const logout = async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await api.post(AUTH_ROUTES.LOGOUT, { refreshToken });
        }
      } catch (e) {
        console.warn("Logout request failed");
      } finally {
        setUser(null);
        localStorage.removeItem("refreshToken");
        router.replace(PAGE_ROUTES.LOGIN);
      }
    };

    return (
      <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
        {!loading ? children : (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-gray-500 font-medium">Verifying session...</p>
            </div>
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