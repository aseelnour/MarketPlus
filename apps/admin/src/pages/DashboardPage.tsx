import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { formatNumber } from "../utils/numbers";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  Sparkles,
  Zap,
  BarChart3,
} from "lucide-react";
import { api } from "../services/api";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { admin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        if (response.data.success) {
          setStats(response.data.data.stats);
          setCharts(response.data.data.charts);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({
          totalSellers: 0,
          pendingSellers: 0,
          activeSellers: 0,
          totalCategories: 0,
          totalProducts: 0,
          totalOrders: 0,
          revenue: 0,
        });
        setCharts({
          revenueData: [],
          topCategories: [],
          recentActivities: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const statCards = [
    {
      title: t("dashboard.stats.totalSellers") || "Total Sellers",
      value: formatNumber(stats?.totalSellers || 0, currentLanguage),
      icon: Store,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: t("dashboard.stats.pendingSellers") || "Pending",
      value: formatNumber(stats?.pendingSellers || 0, currentLanguage),
      icon: Users,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: t("dashboard.stats.activeSellers") || "Active",
      value: formatNumber(stats?.activeSellers || 0, currentLanguage),
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: t("dashboard.stats.totalCategories") || "Categories",
      value: formatNumber(stats?.totalCategories || 0, currentLanguage),
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-purple/20 to-accent-pink/20 p-8 border border-primary-500/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t("dashboard.goodMorning")}
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">
              {t("dashboard.welcome")}, {admin?.firstName}! 👋
            </h1>
            <p className="text-dark-300 mt-1">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-primary-500/20 rounded-xl border border-primary-500/30">
              <span className="text-sm text-primary-400 font-medium">
                {t("dashboard.adminPanel")}
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                {t("dashboard.live")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group hover:border-primary-500/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - تظهر فقط إذا في بيانات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - تظهر فقط إذا في بيانات */}
        {charts?.revenueData && charts.revenueData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {t("dashboard.charts.revenueOverview")}
              </h3>
              <BarChart3 className="w-5 h-5 text-dark-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ fill: "#0ea5e9" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Top Categories - تظهر فقط إذا في بيانات */}
        {charts?.topCategories && charts.topCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              {t("dashboard.charts.topCategories")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.topCategories}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  >
                    {charts.topCategories.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">
          {t("dashboard.activity.title")}
        </h3>
        <div className="space-y-3">
          {charts?.recentActivities && charts.recentActivities.length > 0 ? (
            charts.recentActivities.map((activity: any) => {
              let translatedMessage = activity.message;

              if (activity.type === "new_seller") {
                const storeName = activity.message
                  .replace("New seller registered: ", "")
                  .trim();
                translatedMessage = `${t("dashboard.activity.newSeller")}: ${storeName}`;
              } else if (activity.type === "new_order") {
                const orderInfo = activity.message
                  .replace("New order ", "")
                  .trim();
                translatedMessage = `${t("sellers.activity.newOrder")} ${orderInfo}`;
              } else if (activity.type === "product_added") {
                const productName = activity.message
                  .replace("New product added: ", "")
                  .trim();
                translatedMessage = `${t("sellers.activity.productAdded")}: ${productName}`;
              }

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary-500/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {translatedMessage}
                    </p>
                    <p className="text-dark-400 text-xs">{activity.time}</p>
                  </div>
                  <Clock className="w-4 h-4 text-dark-400" />
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {t("dashboard.activity.noActivities")}
                </p>
                <p className="text-dark-400 text-xs">
                  {t("dashboard.activity.newActivities")}
                </p>
              </div>
              <Clock className="w-4 h-4 text-dark-400" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
