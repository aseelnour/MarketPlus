import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { formatDate, formatNumber, formatTime } from "../utils/numbers";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Store,
  Ban,
  Check,
  RefreshCw,
  Building,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "../components/confirm-dialog";

const API_URL = "http://localhost:5000";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath}`;
};

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
}

interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  storeName: string | null;
  storeDescription?: string | null;
  categories: string[]; 
  storeCategoryIds: Category[]; 
  isActive: boolean;
  isVerified: boolean;
  status: "pending" | "active" | "rejected" | "suspended";
  isApproved: boolean;
  rating: number;
  totalSales: number;
  followers: number;
  createdAt: string;
  lastLogin?: string;
}

interface StoreAdmin {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  storeCategoryIds?: Category[];
  categories: string[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    storeName?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export const SellersPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    suspended: 0,
  });

  const [stores, setStores] = useState<StoreAdmin[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const response = await api.get(`/admin/sellers?${params.toString()}`);
      if (response.data.success) {
        setSellers(response.data.data.sellers);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
      toast.error(t("sellers.fetchError") || "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStores = async () => {
    setStoresLoading(true);
    try {
      const response = await api.get("/admin/stores/all");
      if (response.data.success) {
        setStores(response.data.data.stores);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setStores([]);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
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
    fetchCategories();
  }, []);

  const toggleStoreStatus = async (storeId: string, approve: boolean) => {
    try {
      const endpoint = approve ? "approve" : "reject";
      const response = await api.put(`/admin/stores/${storeId}/${endpoint}`);
      if (response.data.success) {
        toast.success(
          approve
            ? t("sellers.approveStoreSuccess") || "Store approved successfully!"
            : t("sellers.rejectStoreSuccess") || "Store rejected successfully!",
        );
        fetchAllStores();
      }
    } catch (error) {
      toast.error(
        approve
          ? t("sellers.approveStoreError") || "Failed to approve store"
          : t("sellers.rejectStoreError") || "Failed to reject store",
      );
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchAllStores();
  }, [statusFilter, search]);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | "suspend" | "activate" | "delete";
    sellerId: string | null;
  }>({
    isOpen: false,
    type: "reject",
    sellerId: null,
  });

  const showConfirm = (
    type: "approve" | "reject" | "suspend" | "activate" | "delete",
    sellerId: string,
  ) => {
    setConfirmDialog({ isOpen: true, type, sellerId });
  };

  const handleConfirmAction = async () => {
    const { type, sellerId } = confirmDialog;
    if (!sellerId) return;

    switch (type) {
      case "approve":
        await handleApprove(sellerId);
        break;
      case "reject":
        await handleReject(sellerId);
        break;
      case "suspend":
        await handleSuspend(sellerId);
        break;
      case "activate":
        await handleActivate(sellerId);
        break;
      case "delete":
        await handleDelete(sellerId);
        break;
    }

    setConfirmDialog({ isOpen: false, type: "reject", sellerId: null });
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.put(`/admin/sellers/${id}/approve`);
      if (response.data.success) {
        toast.success(
          t("sellers.approveSuccess") || "Seller approved successfully!",
        );
        fetchSellers();
      }
    } catch (error) {
      toast.error(t("sellers.approveError") || "Failed to approve seller");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.put(`/admin/sellers/${id}/reject`);
      if (response.data.success) {
        toast.success(
          t("sellers.rejectSuccess") || "Seller rejected successfully!",
        );
        fetchSellers();
      }
    } catch (error) {
      toast.error(t("sellers.rejectError") || "Failed to reject seller");
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      const response = await api.put(`/admin/sellers/${id}/suspend`);
      if (response.data.success) {
        toast.success(
          t("sellers.suspendSuccess") || "Seller suspended successfully!",
        );
        fetchSellers();
      }
    } catch (error) {
      toast.error(t("sellers.suspendError") || "Failed to suspend seller");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const response = await api.put(`/admin/sellers/${id}/activate`);
      if (response.data.success) {
        toast.success(
          t("sellers.activateSuccess") || "Seller activated successfully!",
        );
        fetchSellers();
      }
    } catch (error) {
      toast.error(t("sellers.activateError") || "Failed to activate seller");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/admin/sellers/${id}`);
      if (response.data.success) {
        toast.success(
          t("sellers.deleteSuccess") || "Seller deleted successfully!",
        );
        fetchSellers();
      }
    } catch (error) {
      toast.error(t("sellers.deleteError") || "Failed to delete seller");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "suspended":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "suspended":
        return <Ban className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getConfirmTitle = (type: string) => {
    const titles: Record<string, string> = {
      approve: t("sellers.confirm.approve.title") || "Approve Seller",
      reject: t("sellers.confirm.reject.title") || "Reject Seller",
      suspend: t("sellers.confirm.suspend.title") || "Suspend Seller",
      activate: t("sellers.confirm.activate.title") || "Activate Seller",
      delete: t("sellers.confirm.delete.title") || "Delete Seller",
    };
    return titles[type] || t("common.confirm") || "Confirm";
  };

  const getConfirmMessage = (type: string) => {
    const messages: Record<string, string> = {
      approve:
        t("sellers.confirm.approve.message") ||
        "Are you sure you want to approve this seller? They will be able to start selling immediately.",
      reject:
        t("sellers.confirm.reject.message") ||
        "Are you sure you want to reject this seller? This action cannot be undone.",
      suspend:
        t("sellers.confirm.suspend.message") ||
        "Are you sure you want to suspend this seller? They will not be able to sell until reactivated.",
      activate:
        t("sellers.confirm.activate.message") ||
        "Are you sure you want to activate this seller? They will be able to sell again.",
      delete:
        t("sellers.confirm.delete.message") ||
        "Are you sure you want to delete this seller? This action cannot be undone.",
    };
    return messages[type] || t("common.areYouSure") || "Are you sure?";
  };

  const getConfirmType = (type: string): "danger" | "warning" | "info" => {
    if (type === "delete" || type === "reject") return "danger";
    if (type === "suspend") return "warning";
    return "info";
  };

  const getCategoryName = (category: Category) => {
    if (!category) return "Unknown";
    return isRTL ? category.nameAr || category.name : category.name;
  };

  const getCategoryNames = (categories: Category[] | string[] | undefined) => {
    if (!categories || categories.length === 0) return [];

    if (categories.length > 0 && typeof categories[0] === "object") {
      return (categories as Category[]).map((cat) => getCategoryName(cat));
    }

    return categories as string[];
  };

  return (
    <div className="space-y-8">
      { }
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("sellers.title") || "Sellers Management"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("sellers.subtitle") ||
              "Manage all sellers, stores, and approvals"}
          </p>
        </div>
        <button
          onClick={() => {
            fetchSellers();
            fetchAllStores();
          }}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-dark-400">
            {t("sellers.stats.total") || "Total"}
          </p>
          <p className="text-2xl font-bold text-white">
            {formatNumber(stats.total, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-yellow-500/30">
          <p className="text-sm text-dark-400">
            {t("sellers.stats.pending") || "Pending"}
          </p>
          <p className="text-2xl font-bold text-yellow-400">
            {formatNumber(stats.pending, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-emerald-500/30">
          <p className="text-sm text-dark-400">
            {t("sellers.stats.active") || "Active"}
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatNumber(stats.active, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-red-500/30">
          <p className="text-sm text-dark-400">
            {t("sellers.stats.rejected") || "Rejected"}
          </p>
          <p className="text-2xl font-bold text-red-400">
            {formatNumber(stats.rejected, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-orange-500/30">
          <p className="text-sm text-dark-400">
            {t("sellers.stats.suspended") || "Suspended"}
          </p>
          <p className="text-2xl font-bold text-orange-400">
            {formatNumber(stats.suspended, currentLanguage)}
          </p>
        </div>
      </div>

      { }
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("sellers.search") || "Search sellers..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">
            {t("sellers.filters.all") || "All Status"}
          </option>
          <option value="pending">
            {t("sellers.filters.pending") || "Pending"}
          </option>
          <option value="active">
            {t("sellers.filters.active") || "Active"}
          </option>
          <option value="rejected">
            {t("sellers.filters.rejected") || "Rejected"}
          </option>
          <option value="suspended">
            {t("sellers.filters.suspended") || "Suspended"}
          </option>
        </select>
      </div>

      { }
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-dark-400 text-sm">
              {t("common.loading") || "Loading..."}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-start">
                    {t("sellers.table.store") || "Store"}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-start">
                    {t("sellers.table.seller") || "Seller"}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-start">
                    {t("sellers.table.categories") || "Categories"}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-start">
                    {t("sellers.table.status") || "Status"}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-start">
                    {t("sellers.table.joined") || "Joined"}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-end">
                    {t("sellers.table.actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {sellers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-dark-400"
                      >
                        {t("sellers.noSellers") || "No sellers found"}
                      </td>
                    </tr>
                  ) : (
                    sellers.map((seller, index) => {
                      const categoryNames = getCategoryNames(
                        seller.categories || [],
                      );

                      return (
                        <motion.tr
                          key={seller._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          { }
                          <td className="px-6 py-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Store className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium">
                                  {seller.storeName || "No Store"}
                                </p>
                                <p className="text-xs text-dark-400 truncate max-w-[150px]">
                                  {seller.storeDescription ||
                                    t("sellers.noDescription") ||
                                    "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          { }
                          <td className="px-6 py-4 text-start">
                            <div>
                              <p className="text-white">
                                {seller.firstName} {seller.lastName}
                              </p>
                              <p className="text-xs text-dark-400">
                                {seller.email}
                              </p>
                            </div>
                          </td>

                          { }
                          <td className="px-6 py-4 text-start">
                            <div className="flex flex-wrap gap-1">
                              {seller.storeCategoryIds &&
                              seller.storeCategoryIds.length > 0 ? (
                                seller.storeCategoryIds
                                  .slice(0, 2)
                                  .map((cat) => (
                                    <span
                                      key={cat._id}
                                      className="px-2 py-0.5 bg-dark-700 rounded-full text-xs text-dark-300"
                                    >
                                      {isRTL
                                        ? cat.nameAr || cat.name
                                        : cat.name}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-xs text-dark-400">
                                  No categories
                                </span>
                              )}
                              {seller.storeCategoryIds &&
                                seller.storeCategoryIds.length > 2 && (
                                  <span className="text-xs text-dark-400">
                                    +{seller.storeCategoryIds.length - 2}
                                  </span>
                                )}
                            </div>
                          </td>

                          { }
                          <td className="px-6 py-4 text-start">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(seller.status)}`}
                            >
                              {getStatusIcon(seller.status)}
                              {t(`sellers.status.${seller.status}`) ||
                                seller.status.charAt(0).toUpperCase() +
                                  seller.status.slice(1)}
                            </span>
                          </td>

                          { }
                          <td className="px-6 py-4 text-start">
                            <p className="text-sm text-white">
                              {formatDate(
                                seller.createdAt,
                                isRTL ? "ar" : "en",
                              )}
                            </p>
                            <p className="text-xs text-dark-400">
                              {formatTime(
                                seller.createdAt,
                                isRTL ? "ar" : "en",
                              )}
                            </p>
                          </td>

                          { }
                          <td className="px-6 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSeller(seller);
                                  setShowDetails(true);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-dark-400 hover:text-white"
                                title={
                                  t("sellers.viewDetails") || "View Details"
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {seller.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      showConfirm("approve", seller._id)
                                    }
                                    className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300"
                                    title={t("sellers.approve") || "Approve"}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      showConfirm("reject", seller._id)
                                    }
                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                    title={t("sellers.reject") || "Reject"}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {seller.status === "active" && (
                                <button
                                  onClick={() =>
                                    showConfirm("suspend", seller._id)
                                  }
                                  className="p-1.5 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-400 hover:text-orange-300"
                                  title={t("sellers.suspend") || "Suspend"}
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              {seller.status === "suspended" && (
                                <button
                                  onClick={() =>
                                    showConfirm("activate", seller._id)
                                  }
                                  className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300"
                                  title={t("sellers.activate") || "Activate"}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  showConfirm("delete", seller._id)
                                }
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title={t("sellers.delete") || "Delete"}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      { }
      <AnimatePresence>
        {showDetails && selectedSeller && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {t("sellers.details.title") || "Seller Details"}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-dark-400" />
                </button>
              </div>

              <div className="space-y-6">
                { }
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t("sellers.details.storeInfo") || "Store Information"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.storeName") || "Store Name"}
                      </p>
                      <p className="text-white font-medium">
                        {selectedSeller.storeName || "No Store"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.status") || "Status"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSeller.status)}`}
                      >
                        {getStatusIcon(selectedSeller.status)}
                        {t(`sellers.status.${selectedSeller.status}`) ||
                          selectedSeller.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.description") || "Description"}
                      </p>
                      <p className="text-white">
                        {selectedSeller.storeDescription ||
                          t("sellers.noDescription") ||
                          "No description"}
                      </p>
                    </div>
                  </div>
                </div>

                { }
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t("sellers.details.sellerInfo") || "Seller Information"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.name") || "Name"}
                      </p>
                      <p className="text-white">
                        {selectedSeller.firstName} {selectedSeller.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.email") || "Email"}
                      </p>
                      <p className="text-white">{selectedSeller.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.phone") || "Phone"}
                      </p>
                      <p className="text-white">
                        {selectedSeller.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-400">
                        {t("sellers.details.joined") || "Joined"}
                      </p>
                      <p className="text-white">
                        {formatDate(selectedSeller.createdAt, currentLanguage)}
                      </p>
                    </div>
                  </div>
                </div>

                { }
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t("sellers.details.categories") || "Store Categories"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeller.storeCategoryIds &&
                    selectedSeller.storeCategoryIds.length > 0 ? (
                      selectedSeller.storeCategoryIds.map((cat) => (
                        <span
                          key={cat._id}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm flex items-center gap-1.5"
                        >
                          {cat.icon && <span>{cat.icon}</span>}
                          {isRTL ? cat.nameAr || cat.name : cat.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-dark-400 text-sm">No categories</p>
                    )}
                  </div>
                </div>

                { }
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(selectedSeller.rating, currentLanguage)}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t("sellers.details.rating") || "Rating"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(selectedSeller.totalSales, currentLanguage)}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t("sellers.details.totalSales") || "Total Sales"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(selectedSeller.followers, currentLanguage)}
                    </p>
                    <p className="text-xs text-dark-400">
                      {t("sellers.details.followers") || "Followers"}
                    </p>
                  </div>
                </div>

                { }
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {selectedSeller.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedSeller._id);
                          setShowDetails(false);
                        }}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                      >
                        {t("sellers.approve") || "Approve Seller"}
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedSeller._id);
                          setShowDetails(false);
                        }}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        {t("sellers.reject") || "Reject Seller"}
                      </button>
                    </>
                  )}
                  {selectedSeller.status === "active" && (
                    <button
                      onClick={() => {
                        handleSuspend(selectedSeller._id);
                        setShowDetails(false);
                      }}
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      {t("sellers.suspend") || "Suspend Seller"}
                    </button>
                  )}
                  {selectedSeller.status === "suspended" && (
                    <button
                      onClick={() => {
                        handleActivate(selectedSeller._id);
                        setShowDetails(false);
                      }}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      {t("sellers.activate") || "Activate Seller"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(selectedSeller._id);
                      setShowDetails(false);
                    }}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    {t("sellers.delete") || "Delete Seller"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: "reject", sellerId: null })
        }
        onConfirm={handleConfirmAction}
        title={getConfirmTitle(confirmDialog.type)}
        message={getConfirmMessage(confirmDialog.type)}
        confirmText={
          t(`sellers.confirm.${confirmDialog.type}.confirm`) ||
          confirmDialog.type.charAt(0).toUpperCase() +
            confirmDialog.type.slice(1)
        }
        cancelText={t("common.cancel") || "Cancel"}
        type={getConfirmType(confirmDialog.type)}
        isLoading={loading}
      />
    </div>
  );
};
