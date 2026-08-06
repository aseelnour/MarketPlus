import axios from "axios";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sellerToken");
  console.log("📤 API Request - Token:", token ? "✅ Present" : "❌ Missing");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response - Success:", response.status);
    return response;
  },
  (error) => {
    console.log(
      "📥 API Response - Error:",
      error.response?.status,
      error.response?.data,
    );

    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - Clearing token but NOT redirecting");
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("seller");
    }

    return Promise.reject(error);
  },
);
