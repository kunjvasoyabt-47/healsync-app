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

    // 🟢 CHANGE: Use endsWith or a more specific check to ensure /auth/me isn't blocked
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }

  if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // 🟢 CHANGE: Resolve by re-calling 'api' with the original config
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

        await api.post(
          `auth/refresh-token`,
          { refreshToken }
          // withCredentials is already on the base 'api' instance, so it's inherited
        );

        processQueue(null); 
        return api(originalRequest); // Retries the current failed request
      }catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
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