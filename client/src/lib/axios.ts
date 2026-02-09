import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: () => resolve(api(originalRequest)), 
            reject: (err) => reject(err) 
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // 🟢 Execute Refresh
        await api.post(`auth/refresh-token`, { refreshToken });

        // 🟢 FIX: After success, the new cookie is set. 
        // Retrying the failed queue now will work with the new cookie.
        processQueue(null); 
        return api(originalRequest); 

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("refreshToken");

        // 🟢 FIX: Only redirect if the refresh actually fails
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
           // Small delay helps avoid infinite redirect loops during state transitions
           setTimeout(() => {
             window.location.href = "/login";
           }, 100);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;