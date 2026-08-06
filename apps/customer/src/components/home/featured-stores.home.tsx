import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Store as StoreIcon, Star, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../../hooks/useLanguage";

interface Store {
  id: string;
  name: string;
  rating: number;
  products: number;
  followers: number;
  isFollowing?: boolean;
  category: string;
  image?: string;
  ownerName?: string;
}

const FeaturedStores = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/customers/stores/featured?limit=4");
        if (mounted) setStores(res.data.stores || res.data || []);
      } catch (err) {
        console.error("Error fetching featured stores", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getStoreSubtitle = (store: Store) => {
    if (store.ownerName) {
      return `${t("store.by") || "By:"} ${store.ownerName}`;
    }

    if (!store.category || store.category === "General") {
      return "";
    }
    const translationKey = `categories.${store.category.toLowerCase()}`;
    const translated = t(translationKey);
    return translated === translationKey ? store.category : translated;
  };

  const displayedStores = isRTL ? [...stores].reverse() : stores;

  return (
    <div className="mb-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {t("home.featuredStores") || "Featured Stores"}
        </h2>
        <button className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700 transition">
          {t("common.seeAll") || "See all"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {displayedStores.map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group rounded-[28px] bg-white border border-violet-100 shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden bg-violet-50/30 flex items-center justify-center">
              {store.image ? (
                <img
                  src={store.image}
                  alt={store.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <StoreIcon className="w-16 h-16 text-violet-200" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>
            <div className="p-5">
              <div
                className={`flex items-center justify-between gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {store.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-light">
                      {getStoreSubtitle(store)}
                    </p>
                  </div>
                </div>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    store.isFollowing
                      ? "bg-violet-50 text-violet-700"
                      : "bg-violet-600 text-white hover:bg-violet-700 active:scale-95"
                  }`}
                >
                  {store.isFollowing
                    ? t("common.following") || "Following"
                    : t("common.follow") || "Follow"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <div className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-slate-900">
                    {store.rating}
                  </span>
                </div>
                <span>•</span>
                <span>
                  {store.products} {t("store.products") || "products"}
                </span>
                <span>•</span>
                <span>
                  {(store.followers / 1000).toFixed(1)}K{" "}
                  {t("store.followers") || "followers"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedStores;
