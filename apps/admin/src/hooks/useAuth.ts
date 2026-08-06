import { useState } from "react";
import { api } from "../services/api";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    admin: Admin;
  };
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post("/admin/auth/login", data);
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("admin", JSON.stringify(response.data.data.admin));
        setAdmin(response.data.data.admin);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || {
          success: false,
          message: "An error occurred during login",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post("/admin/auth/register", data);
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || {
          success: false,
          message: "An error occurred during registration",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const getProfile = async (): Promise<AuthResponse> => {
    try {
      const response = await api.get("/admin/auth/profile");
      if (response.data.success) {
        localStorage.setItem("admin", JSON.stringify(response.data.data.admin));
        setAdmin(response.data.data.admin);
      }
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || {
          success: false,
          message: "Failed to fetch profile",
        }
      );
    }
  };

  return {
    admin,
    isLoading,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated: !!admin && !!localStorage.getItem("token"),
  };
};
