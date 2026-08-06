import { motion } from "framer-motion";
import { Store, Package, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";

interface StatsResponse {
  totalProducts: number;
  totalStores: number;
  totalCategories: number;
  averageRating: number;
}

const StatsSection = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/customers/stats/home");
        if (mounted) setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch home stats", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const { t } = useTranslation();

  const data = [
    {
      icon: <Store className="w-6 h-6 text-violet-600" />,
      value: loading ? "..." : `${stats?.totalStores ?? 0}`,
      label: t("stats.activeStores") || "Active Stores",
    },
    {
      icon: <Package className="w-6 h-6 text-violet-600" />,
      value: loading ? "..." : `${stats?.totalProducts ?? 0}`,
      label: t("stats.products") || "Products",
    },
    {
      icon: <Star className="w-6 h-6 text-violet-600" />,
      value: loading ? "..." : `${(stats?.averageRating ?? 0).toFixed(1)}★`,
      label: t("stats.avgRating") || "Avg. Rating",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {data.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-3xl bg-white border border-violet-100 p-6 flex items-center gap-4 shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 shadow-sm">
            {stat.icon}
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsSection;
