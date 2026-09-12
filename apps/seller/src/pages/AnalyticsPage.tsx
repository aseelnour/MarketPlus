import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/apiClient";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
interface AnalyticsData {
  revenueData: { date: string; revenue: number }[];
  ordersData: { date: string; orders: number }[];
  categoryData: { name: string; value: number }[];
  statusData: { name: string; value: number }[];
  topProducts: {
    _id: string;
    title: string;
    sold: number;
    revenue: number;
    image?: string;
  }[];
  recentOrders: {
    _id: string;
    orderNumber: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
}

export const AnalyticsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRtl = currentLang === "ar";

  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const COLORS = ["#6d28d9", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/seller/analytics?storeId=${storeId}&period=${period}`,
        );
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error(t("analytics.fetchError") || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchAnalytics();
    }
  }, [storeId, period, t]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(
      currentLang === "ar" ? "ar-EG" : "en-US",
    ).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLang === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(currentLang === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-amber-400 bg-amber-500/20";
      case "confirmed":
        return "text-blue-400 bg-blue-500/20";
      case "shipped":
        return "text-purple-400 bg-purple-500/20";
      case "delivered":
        return "text-emerald-400 bg-emerald-500/20";
      case "cancelled":
        return "text-rose-400 bg-rose-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`orders.statuses.${status.toLowerCase()}`, {
      defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>{t("analytics.noData") || "No analytics data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("analytics.title") || "Analytics"}
          </h1>
          <p className="text-sm text-slate-400">
            {t("analytics.subtitle") || "Track your store performance"}
          </p>
        </div>

        {}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "7d"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            {t("analytics.periods.7d") || "7 Days"}
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "30d"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            {t("analytics.periods.30d") || "30 Days"}
          </button>
          <button
            onClick={() => setPeriod("90d")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "90d"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            {t("analytics.periods.90d") || "90 Days"}
          </button>
        </div>
      </div>

      {}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            📈 {t("analytics.charts.revenue") || "Revenue"}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#94a3b8"
                fontSize={11}
                reversed={isRtl}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                orientation={isRtl ? "right" : "left"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "8px",
                  textAlign: isRtl ? "right" : "left",
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number) => [
                  formatCurrency(value),
                  t("analytics.charts.revenue") || "Revenue",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name={t("analytics.charts.revenue") || "Revenue"}
                stroke="#6d28d9"
                strokeWidth={2}
                dot={{ fill: "#6d28d9", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            📊 {t("analytics.charts.orders") || "Orders"}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#94a3b8"
                fontSize={11}
                reversed={isRtl}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                orientation={isRtl ? "right" : "left"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "8px",
                  textAlign: isRtl ? "right" : "left",
                }}
                labelFormatter={(label) => formatDate(label)}
                formatter={(value: number) => [
                  formatNumber(value),
                  t("analytics.charts.orders") || "Orders",
                ]}
              />
              <Legend />
              <Bar
                dataKey="orders"
                name={t("analytics.charts.orders") || "Orders"}
                fill="#6d28d9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            🥧 {t("analytics.charts.categorySales") || "Category Sales"}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${t(`categories.${name}`, { defaultValue: name })} ${formatNumber(
                    Math.round(percent * 100),
                  )}%`
                }
                labelLine={false}
              >
                {data.categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "8px",
                  textAlign: isRtl ? "right" : "left",
                }}
                formatter={(value: number) => [
                  `${formatNumber(value)} ${t("analytics.items") || "items"}`,
                  t("analytics.sales") || "Sales",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            📦 {t("analytics.charts.orderStatus") || "Order Status"}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusData.map((s) => ({
                  ...s,
                  displayName: getStatusLabel(s.name),
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                nameKey="displayName"
                label={({ displayName, percent }) =>
                  `${displayName} ${formatNumber(Math.round(percent * 100))}%`
                }
                labelLine={false}
              >
                {data.statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "8px",
                  textAlign: isRtl ? "right" : "left",
                }}
                formatter={(value: number) => [
                  formatNumber(value),
                  t("analytics.charts.orders") || "Orders",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}

      {}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          🏆 {t("analytics.tables.topProducts") || "Top Selling Products"}
        </h3>
        {data.topProducts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            {t("analytics.tables.noProducts") || "No products sold yet"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400">
                    #
                  </th>
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400">
                    {t("analytics.tables.product") || "Product"}
                  </th>
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400 hidden sm:table-cell">
                    {t("analytics.tables.sold") || "Sold"}
                  </th>
                  <th className="text-end px-3 py-2 text-xs font-semibold text-slate-400">
                    {t("analytics.tables.revenue") || "Revenue"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.topProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-sm font-bold text-slate-400 text-start">
                      #{formatNumber(index + 1)}
                    </td>
                    <td className="px-3 py-2 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={14} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-white truncate max-w-[150px]">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 hidden sm:table-cell text-start">
                      {formatNumber(product.sold)}
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-emerald-400 text-end">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          🛒 {t("analytics.tables.recentOrders") || "Recent Orders"}
        </h3>
        {data.recentOrders.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            {t("analytics.tables.noOrders") || "No orders yet"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400">
                    {t("analytics.tables.order") || "Order"}
                  </th>
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400 hidden sm:table-cell">
                    {t("analytics.tables.date") || "Date"}
                  </th>
                  <th className="text-start px-3 py-2 text-xs font-semibold text-slate-400 hidden md:table-cell">
                    {t("analytics.tables.status") || "Status"}
                  </th>
                  <th className="text-end px-3 py-2 text-xs font-semibold text-slate-400">
                    {t("analytics.tables.total") || "Total"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-sm font-medium text-white text-start">
                      #{order.orderNumber}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 hidden sm:table-cell text-start">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-start">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-white text-end">
                      {formatCurrency(order.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
