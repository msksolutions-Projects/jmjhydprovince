import axios from "axios";

import { API_BASE_URL } from "@/lib/api";

const BASE_URL = API_BASE_URL;

export const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // allows for a sleeping free-tier server waking up and 15 MB uploads
});

// Attach the saved token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, send the user back to login
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;