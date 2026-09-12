
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddProductPage } from "./pages/AddProductPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SellerLayout } from "./layouts/SellerLayout";
import { ProductsPage } from "./pages/ProductsPage";
import { EditProductPage } from "./pages/EditProductPage";
import { StoresPage } from "./pages/StoresPage";
import { OrdersPage } from "./pages/OrdersPage";
import { SellerMessagesPage } from "./pages/MessagesPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <DashboardPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <OrdersPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <OrderDetailsPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <ProductsPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <AddProductPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <EditProductPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <StoresPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerMessagesPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerMessagesPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/messages/:conversationId"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerMessagesPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <CustomersPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <SettingsPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <SellerLayout>
                  <AnalyticsPage />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
