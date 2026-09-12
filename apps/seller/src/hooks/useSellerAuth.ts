import { useState } from "react";
import { api } from "../services/apiClient";

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  storeName: string;
  categories: string[];
  status: string;
  isApproved: boolean;
  rating: number;
  totalSales: number;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    seller: Seller;
  };
}

export const useSellerAuth = () => {
  const [seller, setSeller] = useState<Seller | null>(() => {
    const stored = localStorage.getItem("seller");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post("/seller/auth/login", data);
      if (response.data.success) {
        localStorage.setItem("sellerToken", response.data.data.token);
        localStorage.setItem(
          "seller",
          JSON.stringify(response.data.data.seller),
        );
        setSeller(response.data.data.seller);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
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
      const response = await api.post("/seller/auth/register", data);
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
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("seller");
    setSeller(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const getProfile = async (): Promise<AuthResponse> => {
    try {
      const response = await api.get("/seller/auth/profile");
      if (response.data.success) {
        localStorage.setItem(
          "seller",
          JSON.stringify(response.data.data.seller),
        );
        setSeller(response.data.data.seller);
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
    seller,
    isLoading,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated: !!localStorage.getItem("sellerToken"),
  };
};
