import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach the NextAuth session access token ─────────────
axiosInstance.interceptors.request.use(async (config) => {
  // getSession() works on the client; it reads the active NextAuth session.
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  // For file uploads, let the browser set multipart/form-data with its boundary.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// ── Response interceptor: normalize errors + handle auth expiry ───────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // Session expired / unauthorized → bounce to login (client only).
    if ((status === 401 || status === 403) && typeof window !== "undefined") {
      const onAuthPage = window.location.pathname.startsWith("/login");
      if (!onAuthPage && status === 401) {
        signOut({ callbackUrl: "/login" });
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
