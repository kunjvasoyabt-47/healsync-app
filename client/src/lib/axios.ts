import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
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

    console.log("🔴 [Interceptor] Caught error:", error.response?.status, originalRequest.url);

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      console.log("⚠️ [Interceptor] Refresh endpoint failed - not retrying");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        console.log("⏳ [Interceptor] Already refreshing, queueing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: () => {
              console.log("✅ [Interceptor] Queue processed, retrying request");
              resolve(api(originalRequest));
            }, 
            reject: (err) => reject(err) 
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log("🔄 [Interceptor] Starting token refresh...");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log("❌ [Interceptor] No refresh token found");
          throw new Error("No refresh token");
        }

        console.log("📡 [Interceptor] Calling refresh endpoint...");
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, 
          { refreshToken }, 
          { withCredentials: true }
        );

        console.log("✅ [Interceptor] Refresh successful, processing queue...");
        processQueue(null);
        isRefreshing = false;
        
        return api(originalRequest);

      } catch (refreshError) {
        console.log("❌ [Interceptor] Refresh failed:", refreshError);
        processQueue(refreshError);
        isRefreshing = false;
        localStorage.removeItem("refreshToken");

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          console.log("🚪 [Interceptor] Redirecting to login...");
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;