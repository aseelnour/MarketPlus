
import { useState, useEffect } from "react";
import {
  Store,
  Search,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  X,
  User,
  Mail,
  Calendar,
  Building,
  Package,
  Users,
  Check,
  Ban,
} from "lucide-react";
import { api, getImageUrl } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface StoreData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  categories?: string[];
  storeCategoryIds?: string[];
  products?: any[];
  followers?: any[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
}

export const AdminStoresPage = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, [filterFeatured]);

  const fetchStores = async () => {
    try {
      const url = filterFeatured
        ? `/admin/stores/stores?featured=true`
        : `/admin/stores/stores`;
      const res = await api.get(url);
      if (res.data.success) {
        const storesData = res.data.data.stores || [];

        const storesWithCategories = await Promise.all(
          storesData.map(async (store: any) => {
            if (store.storeCategoryIds && store.storeCategoryIds.length > 0) {
              const catRes = await api.get(`/admin/categories/store`);
              if (catRes.data.success) {
                const allCats = catRes.data.data.categories || [];
                store.categories = store.storeCategoryIds.map((id: string) => {
                  const cat = allCats.find((c: any) => c._id === id);
                  return cat?.name || id;
                });
              }
            }
            return store;
          }),
        );

        setStores(storesWithCategories);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/store");
      if (res.data.success) {
        setCategories(res.data.data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const viewStoreDetails = (store: StoreData) => {
    setSelectedStore(store);
    setShowModal(true);
  };

  const approveStore = async (storeId: string) => {
    try {
      const res = await api.put(`/admin/stores/${storeId}/approve`);
      if (res.data.success) {
        toast.success("Store approved successfully!");
        fetchStores();
      }
    } catch (error) {
      console.error("Failed to approve store:", error);
      toast.error("Failed to approve store");
    }
  };

  const rejectStore = async (storeId: string) => {
    try {
      const res = await api.put(`/admin/stores/${storeId}/reject`);
      if (res.data.success) {
        toast.success("Store rejected!");
        fetchStores();
      }
    } catch (error) {
      console.error("Failed to reject store:", error);
      toast.error("Failed to reject store");
    }
  };

  const activateStore = async (storeId: string) => {
    try {
      const res = await api.put(`/admin/stores/${storeId}/activate`);
      if (res.data.success) {
        toast.success("Store activated successfully!");
        fetchStores();
      }
    } catch (error) {
      console.error("Failed to activate store:", error);
      toast.error("Failed to activate store");
    }
  };

  const toggleFeatured = async (storeId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/admin/stores/stores/${storeId}/featured`, {
        isFeatured: !currentStatus,
      });
      if (res.data.success) {
        toast.success(`Store ${!currentStatus ? "featured" : "unfeatured"}`);
        fetchStores();
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
      toast.error("Failed to update featured status");
    }
  };
  const locale = isRTL ? "ar-EG" : "en-US";

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const allCategories = stores
    .flatMap((store) => store.categories || [])
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  const filteredStores = stores
    .filter((store) =>
      selectedCategory === "all"
        ? true
        : store.categories?.includes(selectedCategory),
    )
    .filter(
      (store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.owner.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      { }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("stores.title")}</h1>
          <p className="text-sm text-slate-400">
            {t("stores.found", { count: filteredStores.length })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-slate-400`}
              size={16}
            />
            <input
              type="text"
              placeholder={t("stores.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 w-48 sm:w-64`}
            />
          </div>

          <button
            onClick={() => setFilterFeatured(!filterFeatured)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterFeatured
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50"
            }`}
          >
            <Star size={14} />
            {filterFeatured ? t("stores.featured.title") : t("stores.all")}
          </button>
        </div>
      </div>

      { }
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            key="all-categories"
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50"
            }`}
          >
            <span className="text-base leading-none">✦</span>
            <span>{t("stores.all")}</span>
            <span className="text-xs opacity-70">
              ({stores.length.toLocaleString(isRTL ? "ar-EG" : "en-US")})
            </span>
          </button>

          {allCategories.map((cat) => {
            const count = stores.filter((s) =>
              s.categories?.includes(cat),
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50"
                }`}
              >
                <span className="text-base leading-none">{cat.charAt(0)}</span>
                <span>{cat}</span>
                <span className="text-xs opacity-70">
                  ({count.toLocaleString(isRTL ? "ar-EG" : "en-US")})
                </span>
              </button>
            );
          })}
        </div>
      )}

      { }
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-start">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-start">
                  {t("stores.table.store")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 hidden md:table-cell text-start">
                  {t("stores.table.owner")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 hidden lg:table-cell text-start">
                  {t("stores.table.categories")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 hidden xl:table-cell text-start">
                  {t("stores.table.status")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-start">
                  {t("stores.table.featured")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-end">
                  {t("stores.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Store size={40} className="mx-auto mb-2 opacity-30" />
                    <p>{t("stores.notFound")}</p>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const canBeFeatured = store.isActive && store.isVerified;

                  return (
                    <tr
                      key={store._id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      { }
                      <td className="px-4 py-3 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {store.logo ? (
                              <img
                                src={getImageUrl(store.logo)}
                                alt={store.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const icon = document.createElement("span");
                                    icon.className = "text-slate-400";
                                    icon.innerHTML =
                                      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                                    parent.appendChild(icon);
                                  }
                                }}
                              />
                            ) : (
                              <Store size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {store.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[150px]">
                              {store.description || t("stores.noDescription")}
                            </p>
                          </div>
                        </div>
                      </td>

                      { }
                      <td className="px-4 py-3 hidden md:table-cell text-start">
                        <div>
                          <p className="text-sm text-white">
                            {store.owner.firstName} {store.owner.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {store.owner.email}
                          </p>
                        </div>
                      </td>

                      { }
                      <td className="px-4 py-3 hidden lg:table-cell text-start">
                        <div className="flex flex-wrap gap-1">
                          {store.storeCategoryIds &&
                          store.storeCategoryIds.length > 0 ? (
                            <>
                              {store.storeCategoryIds.slice(0, 2).map((id) => {
                                const cat = categories.find(
                                  (c) => c._id === id,
                                );
                                return (
                                  <span
                                    key={id}
                                    className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full"
                                  >
                                    {cat?.name || t("stores.unknown")}
                                  </span>
                                );
                              })}
                              {store.storeCategoryIds.length > 2 && (
                                <span className="text-xs text-slate-400">
                                  +
                                  {(
                                    store.storeCategoryIds.length - 2
                                  ).toLocaleString(isRTL ? "ar-EG" : "en-US")}
                                </span>
                              )}
                            </>
                          ) : store.categories &&
                            store.categories.length > 0 ? (
                            store.categories.slice(0, 2).map((cat) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              {t("stores.noCategories")}
                            </span>
                          )}
                        </div>
                      </td>

                      { }
                      <td className="px-4 py-3 hidden xl:table-cell text-start">
                        <div className="flex items-center gap-2">
                          {store.isActive ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle size={12} />
                              {t("stores.status.active")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-rose-400">
                              <XCircle size={12} />
                              {t("stores.status.inactive")}
                            </span>
                          )}
                          {store.isVerified && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                              {t("stores.status.verified")}
                            </span>
                          )}
                        </div>
                      </td>

                      { }
                      <td className="px-4 py-3 text-start">
                        <button
                          onClick={() => {
                            if (canBeFeatured) {
                              toggleFeatured(store._id, store.isFeatured);
                            } else {
                              toast.error(t("stores.featuredNotAllowed"));
                            }
                          }}
                          disabled={!canBeFeatured}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            store.isFeatured
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : canBeFeatured
                                ? "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                                : "bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {store.isFeatured ? (
                            <>
                              <Star size={12} className="fill-amber-400" />
                              {t("stores.featured.title")}
                            </>
                          ) : (
                            <>
                              <StarOff size={12} />
                              {t("stores.featured.make")}
                            </>
                          )}
                        </button>
                      </td>

                      { }
                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {!store.isActive && !store.isVerified && (
                            <>
                              <button
                                onClick={() => approveStore(store._id)}
                                className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300"
                                title={t("stores.actions.approve")}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => rejectStore(store._id)}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title={t("stores.actions.reject")}
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}

                          {!store.isActive && store.isVerified && (
                            <button
                              onClick={() => activateStore(store._id)}
                              className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300"
                              title={t("stores.actions.activate")}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => viewStoreDetails(store)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title={t("stores.actions.view")}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      { }
      <AnimatePresence>
        {showModal && selectedStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
              dir={isRTL ? "rtl" : "ltr"}
            >
              { }
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedStore.name}
                  </h2>
                  <p className="text-sm text-slate-400">{selectedStore.slug}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                { }
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedStore.logo ? (
                      <img
                        src={getImageUrl(selectedStore.logo)}
                        alt={selectedStore.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const icon = document.createElement("span");
                            icon.className = "text-slate-400";
                            icon.innerHTML =
                              '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    ) : (
                      <Store size={30} className="text-slate-400" />
                    )}
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {selectedStore.name}
                      </span>
                      {selectedStore.isVerified && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                          {t("stores.status.verified")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {selectedStore.description || t("stores.noDescription")}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        ⭐{" "}
                        {(selectedStore.rating || 0).toLocaleString(
                          isRTL ? "ar-EG" : "en-US",
                        )}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span
                        className={`text-xs ${
                          selectedStore.isActive
                            ? "text-emerald-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {selectedStore.isActive
                          ? "🟢 " + t("stores.status.active")
                          : "⏳ " + t("stores.status.pending")}
                      </span>
                    </div>
                  </div>
                </div>

                { }
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 text-start">
                    <User size={16} className="text-slate-400" />
                    {t("stores.modal.storeOwner")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-start">
                      <p className="text-xs text-slate-400">
                        {t("stores.modal.name")}
                      </p>
                      <p className="text-white font-medium">
                        {selectedStore.owner.firstName}{" "}
                        {selectedStore.owner.lastName}
                      </p>
                    </div>
                    <div className="text-start">
                      <p className="text-xs text-slate-400">
                        {t("stores.modal.email")}
                      </p>
                      <p className="text-white">{selectedStore.owner.email}</p>
                    </div>
                  </div>
                </div>

                { }
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 text-start">
                    <Building size={16} className="text-slate-400" />
                    {t("stores.modal.categories")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStore.storeCategoryIds &&
                    selectedStore.storeCategoryIds.length > 0 ? (
                      selectedStore.storeCategoryIds.map((id) => {
                        const cat = categories.find((c) => c._id === id);
                        return (
                          <span
                            key={id}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                          >
                            {cat?.name || t("stores.unknown")}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-sm">
                        {t("stores.noCategories")}
                      </p>
                    )}
                  </div>
                </div>

                { }
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(selectedStore.products?.length || 0).toLocaleString(
                        isRTL ? "ar-EG" : "en-US",
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("stores.modal.products")}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(selectedStore.followers?.length || 0).toLocaleString(
                        isRTL ? "ar-EG" : "en-US",
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("stores.modal.followers")}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-lg font-bold text-white">
                      {(selectedStore.rating || 0).toLocaleString(
                        isRTL ? "ar-EG" : "en-US",
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("stores.modal.rating")}
                    </p>
                  </div>
                </div>

                { }
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Calendar size={14} />
                    {t("stores.modal.created")}
                  </span>
                  <span className="text-sm text-white">
                    {t("stores.modal.createdAt", {
                      date: formatDate(selectedStore.createdAt),
                      time: formatTime(selectedStore.createdAt),
                    })}
                  </span>
                </div>

                { }
                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      const canBeFeatured =
                        selectedStore.isActive && selectedStore.isVerified;
                      if (canBeFeatured) {
                        toggleFeatured(
                          selectedStore._id,
                          selectedStore.isFeatured,
                        );
                        setShowModal(false);
                      } else {
                        toast.error(t("stores.featuredNotAllowed"));
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      selectedStore.isFeatured
                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    }`}
                  >
                    {selectedStore.isFeatured
                      ? t("stores.featured.remove")
                      : t("stores.featured.make")}
                  </button>
                  <button
                    onClick={() => {
                      window.open(
                        `http://localhost:3002/store/${selectedStore._id}`,
                        "_blank",
                      );
                    }}
                    className="flex-1 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    {t("stores.modal.viewStore")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
