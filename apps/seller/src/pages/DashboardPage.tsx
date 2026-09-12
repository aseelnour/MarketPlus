import React, { useEffect, useState } from "react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { formatNumber } from "../utils/numbers";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  Users,
  Activity,
  Clock,
  Sparkles,
  Zap,
  Store,
  BarChart3,
  Folder,
  PlusCircle,
} from "lucide-react";
import { api } from "../services/apiClient";
import { motion } from "framer-motion";
import { CategoryManager } from "../components/CategoryManager";
import toast from "react-hot-toast";

interface SellerCategory {
  _id: string;
  name: string;
  nameAr?: string;
  mainCategoryId:
    | {
        _id: string;
        name: string;
        nameAr?: string;
      }
    | string;
  isActive: boolean;
  products: string[];
}

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isRTL } = useLanguage();
  const { seller } = useSellerAuth();
  const [primaryStoreName, setPrimaryStoreName] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storesCount, setStoresCount] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const activeStoreId =
    searchParams.get("storeId") || localStorage.getItem("lastActiveStoreId");
  const navigate = useNavigate();

  const [sellerCategories, setSellerCategories] = useState<SellerCategory[]>(
    [],
  );

  useEffect(() => {
    let activeStoreId = searchParams.get("storeId");

    if (!activeStoreId || activeStoreId === "null") {
      activeStoreId = localStorage.getItem("lastActiveStoreId");
      if (activeStoreId && activeStoreId !== "null") {
        navigate(`/dashboard?storeId=${activeStoreId}`, { replace: true });
        return;
      }
    } else {
      localStorage.setItem("lastActiveStoreId", activeStoreId);
    }

    if (!activeStoreId || activeStoreId === "null") {
      navigate("/stores");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        if (!activeStoreId || activeStoreId === "null") {
          console.warn("⚠️ No active store ID found");

          try {
            const storesRes = await api.get("/seller/stores");
            const stores = storesRes.data.data.stores || [];
            const activeStores = stores.filter((s: any) => s.isActive === true);

            if (activeStores.length > 0) {
              const firstStoreId = activeStores[0]._id;
              localStorage.setItem("lastActiveStoreId", firstStoreId);
              navigate(`/dashboard?storeId=${firstStoreId}`);
              return;
            } else {
              setError("No active stores found. Please create a store first.");
              setStats({
                totalProducts: 0,
                totalOrders: 0,
                totalRevenue: 0,
                totalSales: 0,
                rating: 0,
                followers: 0,
                totalSellerCategories: 0,
              });
              return;
            }
          } catch (storeError) {
            console.error("Failed to fetch stores:", storeError);
            setError("Failed to load stores");
            return;
          }
        }

        const response = await api.get(
          `/seller/dashboard?storeId=${activeStoreId}`,
        );

        if (response.data.success) {
          setStats(response.data.data.stats);
          setError(null);
        }
      } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response?.status === 404) {
          console.warn("⚠️ Store not found, trying to get first active store");

          try {
            const storesRes = await api.get("/seller/stores");
            const stores = storesRes.data.data.stores || [];
            const activeStores = stores.filter((s: any) => s.isActive === true);

            if (activeStores.length > 0) {
              const firstStoreId = activeStores[0]._id;
              localStorage.setItem("lastActiveStoreId", firstStoreId);
              navigate(`/dashboard?storeId=${firstStoreId}`);

              return;
            } else {
              setError("No active stores found. Please create a store first.");
            }
          } catch (storeError) {
            console.error("Failed to fetch stores:", storeError);
            setError("Failed to load stores. Please try again.");
          }

          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalSales: 0,
            rating: 0,
            followers: 0,
            totalSellerCategories: 0,
          });
        } else {
          setError("Failed to load dashboard data");
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalSales: 0,
            rating: 0,
            followers: 0,
            totalSellerCategories: 0,
          });
        }
      }
    };

    const loadStoresAndDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get("/seller/stores");
        const stores = res.data.data.stores || res.data.stores || [];

        setStoresCount(stores.length);

        if (stores.length > 0) {
          const activeStore = stores.find((s: any) => s._id === activeStoreId);
          setPrimaryStoreName(activeStore?.name || stores[0].name);

          await fetchDashboardData();
        } else {
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalSales: 0,
            rating: 0,
            followers: 0,
            totalSellerCategories: 0,
          });
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadStoresAndDashboard();
  }, [searchParams, navigate]);

  useEffect(() => {
    const fetchSellerCategories = async () => {
      try {
        const response = await api.get("/seller/categories/seller");
        if (response.data.success) {
          setSellerCategories(response.data.data.sellerCategories || []);
        }
      } catch (error) {
        console.error("Failed to fetch seller categories:", error);
      }
    };
    fetchSellerCategories();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.goodMorning") || "Good Morning";
    if (hour < 18) return t("dashboard.goodAfternoon") || "Good Afternoon";
    return t("dashboard.goodEvening") || "Good Evening";
  };

  const statCards = [
    {
      title: t("dashboard.stats.totalProducts") || "Total Products",
      value: formatNumber(stats?.totalProducts || 0, currentLanguage),
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: t("dashboard.stats.totalOrders") || "Total Orders",
      value: formatNumber(stats?.totalOrders || 0, currentLanguage),
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: t("dashboard.stats.totalRevenue") || "Total Revenue",
      value: formatNumber(stats?.totalRevenue || 0, currentLanguage),
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: t("dashboard.stats.sellerCategories") || "Categories",
      value: formatNumber(stats?.totalSellerCategories || 0, currentLanguage),
      icon: Folder,
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 glass rounded-2xl p-8">
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (storesCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-12 max-w-2xl w-full text-center border border-white/10"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            {t("dashboard.noStoreFound") || "You haven't created a store yet!"}
          </h2>
          <p className="text-dark-400 text-lg mb-8">
            {t("dashboard.noStoreDesc") ||
              "You need to create your first store to start selling products and managing your business."}
          </p>
          <button
            onClick={() => navigate("/stores")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105"
          >
            <PlusCircle className="w-6 h-6" />
            {t("dashboard.createStore") || "Create Your Store Now"}
          </button>
          <p className="text-dark-400 text-sm mt-6">
            {t("dashboard.noStoreSub") ||
              "It only takes a minute. You'll add your store name, logo, and cover image."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 p-8 border border-emerald-500/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {getGreeting()}
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">
              {t("dashboard.welcome") || "Welcome back"}, {seller?.firstName}!
              👋
            </h1>
            <p className="text-dark-300 mt-1">
              {t("dashboard.subtitle") || "Manage your store and products"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <span className="text-sm text-emerald-400 font-medium">
                {primaryStoreName || seller?.storeName || "Store"}
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                {seller?.status === "active" ? "🟢 Live" : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("dashboard.storeInfo") || "Store Information"}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-dark-400">
                {t("dashboard.storeName") || "Store Name"}
              </span>
              <span className="text-white font-medium">
                {seller?.storeName || primaryStoreName || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-400">
                {t("dashboard.categories") || "Categories"}
              </span>
              <span className="text-white font-medium">
                {formatNumber(
                  stats?.totalSellerCategories || 0,
                  currentLanguage,
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-400">
                {t("dashboard.stats.totalSales") || "Total Sales"}
              </span>
              <span className="text-white font-medium">
                {formatNumber(stats?.totalRevenue || 0, currentLanguage)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-400">
                {t("dashboard.stats.followers") || "Followers"}
              </span>
              <span className="text-white font-medium">
                {formatNumber(stats?.followers || 0, currentLanguage)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-400">
                {t("dashboard.status") || "Status"}
              </span>
              <span
                className={`font-medium ${
                  seller?.status === "active"
                    ? "text-emerald-400"
                    : seller?.status === "pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {seller?.status === "active"
                  ? "✅ Active"
                  : seller?.status === "pending"
                    ? "⏳ Pending"
                    : "❌ Suspended"}
              </span>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("dashboard.quickActions") || "Quick Actions"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/add-product?storeId=${activeStoreId}`)}
              className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group"
            >
              <Package className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-white">
                {t("dashboard.addProduct") || "Add Product"}
              </span>
            </button>

            <button
              onClick={() => navigate(`/orders?storeId=${activeStoreId}`)}
              className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
            >
              <ShoppingCart className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-white">
                {t("dashboard.viewOrders") || "View Orders"}
              </span>
            </button>

            <button
              onClick={() => navigate(`/customers?storeId=${activeStoreId}`)}
              className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors group"
            >
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-white">
                {t("dashboard.customers") || "Customers"}
              </span>
            </button>

            <button
              onClick={() => navigate(`/analytics?storeId=${activeStoreId}`)}
              className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 hover:bg-orange-500/20 transition-colors group"
            >
              <BarChart3 className="w-6 h-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-white">
                {t("dashboard.analytics") || "Analytics"}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          {t("dashboard.manageCategories") || "Manage Your Categories"}
        </h3>
        <p className="text-sm text-dark-400 mb-4">
          {t("dashboard.manageCategoriesDesc") ||
            "Create and manage your own sub-categories under the main categories approved by admin."}
        </p>
        <CategoryManager
          sellerCategories={sellerCategories}
          onUpdate={(updatedCategories) => {
            setSellerCategories(updatedCategories);
            setStats((prev: any) => ({
              ...prev,
              totalSellerCategories: updatedCategories.length,
            }));
          }}
        />
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">
          {t("dashboard.activity.title") || "Recent Activity"}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                {t("dashboard.activity.noActivities") ||
                  "No recent activities to show"}
              </p>
              <p className="text-dark-400 text-xs">
                {t("dashboard.activity.newActivities") ||
                  "New activities will appear here"}
              </p>
            </div>
            <Clock className="w-4 h-4 text-dark-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
