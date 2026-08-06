import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("sellerToken");
  const seller = localStorage.getItem("seller");

  console.log(
    "🔒 ProtectedRoute - Token:",
    token ? "✅ Present" : "❌ Missing",
  );
  console.log(
    "🔒 ProtectedRoute - Seller:",
    seller ? "✅ Present" : "❌ Missing",
  );

  if (!token || !seller) {
    console.log("🔒 ProtectedRoute - Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("🔒 ProtectedRoute - Rendering protected content");
  return <>{children}</>;
};
