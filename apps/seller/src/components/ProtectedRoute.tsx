import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("sellerToken");
  const seller = localStorage.getItem("seller");

  if (!token || !seller) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
