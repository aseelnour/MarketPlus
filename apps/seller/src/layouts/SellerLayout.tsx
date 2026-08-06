import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Bell,
  Sparkles,
  Store,
  Users,
  BarChart3,
} from "lucide-react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { api } from "../services/api";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const { seller, logout } = useSellerAuth();
  const [primaryStoreName, setPrimaryStoreName] = React.useState<string | null>(
    null,
  );
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const loadPrimaryStore = async () => {
    try {
      const res = await api.get("/seller/stores");
      const stores = res.data.data.stores || [];
      if (stores.length) setPrimaryStoreName(stores[0].name);
    } catch (err) {
      // ignore
    }
  };
  loadPrimaryStore();

  const handleLogout = () => {
    logout();
    toast.success(t("auth.login.success") || "Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard") || "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Package,
      label: t("sidebar.products") || "Products",
      path: "/products",
    },
    {
      icon: ShoppingCart,
      label: t("sidebar.orders") || "Orders",
      path: "/orders",
    },
    {
      icon: Store,
      label: t("sidebar.stores") || "Stores",
      path: "/stores",
    },
    {
      icon: Users,
      label: t("sidebar.customers") || "Customers",
      path: "/customers",
    },
    {
      icon: BarChart3,
      label: t("sidebar.analytics") || "Analytics",
      path: "/analytics",
    },
    {
      icon: Settings,
      label: t("sidebar.settings") || "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-emerald-950/20 to-dark-950">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full w-64 glass-dark border-r border-white/10 p-4 transition-all duration-300 ${
          isRTL ? "right-0 border-l border-r-0" : "left-0"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 px-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {t("app.name") || "MarketPlus"}
          </span>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform text-dark-400 group-hover:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="p-4 glass rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {seller?.firstName} {seller?.lastName}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {seller?.email}
                </p>
                <p className="text-xs text-emerald-400 truncate">
                  {primaryStoreName || seller?.storeName}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  seller?.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : seller?.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                }`}
              >
                {seller?.status === "active"
                  ? "🟢 Active"
                  : seller?.status === "pending"
                    ? "⏳ Pending"
                    : seller?.status === "suspended"
                      ? "🔴 Suspended"
                      : "⚪ Unknown"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t("sidebar.logout") || "Logout"}
            </button>
          </div>
        </motion.div>
      </aside>

      {/* Main Content */}
      <main
        className={`p-8 ${isRTL ? "mr-64" : "ml-64"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t("dashboard.welcome") || "Welcome back"}
            </h2>
            <p className="text-dark-400">
              {t("dashboard.subtitle") || "Manage your store and products"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button className="p-2 rounded-lg glass hover:bg-white/10 text-dark-300 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </motion.div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};
