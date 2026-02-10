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
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 🟢 FIX: Return the api call itself so it waits for the resolve
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

        // 🟢 FIX: Use base axios for the refresh call to avoid triggering 
        // this interceptor recursively
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, 
          { refreshToken }, 
          { withCredentials: true }
        );

        // 🟢 FIX: The order here is critical
        isRefreshing = false; 
        processQueue(null); 
        return api(originalRequest); 

      } catch (refreshError) {
        // 🔴 FAIL: Reset state and clear storage before redirect
        isRefreshing = false;
        processQueue(refreshError, null);
        localStorage.removeItem("refreshToken");

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
         //  window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;