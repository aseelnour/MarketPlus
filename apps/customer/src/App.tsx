import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Sidebar from "./layouts/sidebar";
import Header from "./layouts/header";
import Home from "./pages/home.page";
import Stores from "./pages/stores.page";
import Cart from "./pages/cart.page";
import Wishlist from "./pages/wishlist.page";
import Profile from "./pages/profile.page";
import "./i18n";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // تعيين اتجاه الصفحة حسب اللغة
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <div
        className={`flex min-h-screen bg-[#f7f4ff] ${i18n.language === "ar" ? "rtl" : "ltr"}`}
      >
        <Sidebar />
        <div className={`flex-1 ${i18n.language === "ar" ? "mr-64" : "ml-64"}`}>
          <Header />
          <main className="p-6 md:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
