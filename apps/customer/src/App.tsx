
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import StoresPage from "./pages/StoresPage";
import { CartPage } from "./pages/CartPage";
import { WishlistPage } from "./pages/WishlistPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { StoreDetailsPage } from "./pages/StoreDetailsPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { updateDirection } from "./utils/direction"; 

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    updateDirection(i18n.language);
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/store/:storeId" element={<StoreDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/messages/:orderId" element={<MessagesPage />} />
          <Route path="/order/:orderId" element={<OrderDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
