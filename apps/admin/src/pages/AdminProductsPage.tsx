import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Eye,
  Trash2,
  Package,
  RefreshCw,
  CheckCircle,
  XCircle,
  X,
  Store,
  Tag,
  DollarSign,
  Layers,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "../components/confirm-dialog";
import { formatNumber } from "../utils/numbers";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  brand?: string;
  images: string[];
  rating: number;
  isActive: boolean;
  sellerId: {
    _id: string;
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mainCategoryId: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  sellerCategoryId: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  createdAt: string;
}

interface Seller {
  _id: string;
  storeName: string;
  firstName: string;
  lastName: string;
}

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
}

// SVG Placeholder - مشفر كـ Base64 (بديل مثالي عن placeholder.jpg)
const PLACEHOLDER_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiLz48L3N2Zz4=`;

// دالة قوية جداً للتعامل مع أخطاء الصور
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  img.onerror = null; // منع التكرار اللانهائي
  img.src = PLACEHOLDER_SVG; // استخدام الـ SVG المشفر
  img.className = "w-full h-full object-contain p-2 bg-dark-700";
  img.style.objectFit = "contain";
};

export const AdminProductsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedProductDetails, setSelectedProductDetails] =
    useState<Product | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productTitle: string;
  }>({
    isOpen: false,
    productId: null,
    productTitle: "",
  });

  // منع أي طلب لـ placeholder.jpg على مستوى التطبيق
  useEffect(() => {
    // منع تحميل أي صورة باسم placeholder.jpg
    const originalImage = window.Image;
    window.Image = class extends originalImage {
      constructor() {
        super();
        // اعتراض أي محاولة لتحميل placeholder.jpg
        this.addEventListener("error", function (e) {
          if (this.src && this.src.includes("placeholder.jpg")) {
            e.preventDefault();
            e.stopPropagation();
            this.src = PLACEHOLDER_SVG;
          }
        });
      }
    };

    // منع الطلبات عبر fetch للصور
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = input.toString();
      if (url.includes("placeholder.jpg")) {
        // إرجاع استجابة فارغة بدلاً من طلب الصورة
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      return originalFetch.call(this, input, init);
    };

    return () => {
      window.Image = originalImage;
      window.fetch = originalFetch;
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedSeller !== "all") params.append("sellerId", selectedSeller);
      if (selectedCategory !== "all")
        params.append("categoryId", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const response = await api.get(`/admin/products?${params.toString()}`);
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [sellersRes, categoriesRes] = await Promise.all([
          api.get("/admin/sellers"),
          api.get("/admin/categories"),
        ]);

        if (sellersRes.data.success) {
          setSellers(sellersRes.data.data.sellers || []);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedSeller, selectedCategory, selectedStatus]);

  const handleDeleteProduct = async () => {
    const { productId } = confirmDialog;
    if (!productId) return;

    try {
      const response = await api.delete(`/admin/products/${productId}`);
      if (response.data.success) {
        toast.success("Product deleted successfully!");
        setProducts(products.filter((p) => p._id !== productId));
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setConfirmDialog({ isOpen: false, productId: null, productTitle: "" });
    }
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean,
  ) => {
    try {
      const response = await api.patch(`/admin/products/${productId}/status`, {
        isActive: !currentStatus,
      });
      if (response.data.success) {
        toast.success(
          `Product ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        );
        setProducts(
          products.map((p) =>
            p._id === productId ? { ...p, isActive: !currentStatus } : p,
          ),
        );
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update product status",
      );
    }
  };

  const getSellerName = (seller: any) => {
    if (!seller) return "Unknown";
    return seller.storeName || `${seller.firstName} ${seller.lastName}`;
  };

  const getCategoryName = (category: any) => {
    if (!category) return "Unknown";
    return isRTL ? category.nameAr || category.name : category.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("adminProducts.title") || "All Products"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("adminProducts.subtitle") ||
              "Manage all products across all sellers"}
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-dark-400">
            {t("adminProducts.stats.total") || "Total"}
          </p>
          <p className="text-2xl font-bold text-white">
            {formatNumber(products.length, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-emerald-500/30">
          <p className="text-sm text-dark-400">
            {t("adminProducts.stats.active") || "Active"}
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatNumber(
              products.filter((p) => p.isActive).length,
              currentLanguage,
            )}
          </p>
        </div>
        <div className="card p-4 border-red-500/30">
          <p className="text-sm text-dark-400">
            {t("adminProducts.stats.inactive") || "Inactive"}
          </p>
          <p className="text-2xl font-bold text-red-400">
            {formatNumber(
              products.filter((p) => !p.isActive).length,
              currentLanguage,
            )}
          </p>
        </div>
        <div className="card p-4 border-yellow-500/30">
          <p className="text-sm text-dark-400">
            {t("adminProducts.stats.outOfStock") || "Out of Stock"}
          </p>
          <p className="text-2xl font-bold text-yellow-400">
            {formatNumber(
              products.filter((p) => p.quantity === 0).length,
              currentLanguage,
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("adminProducts.search") || "Search products..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <select
          value={selectedSeller}
          onChange={(e) => setSelectedSeller(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">
            {t("adminProducts.allSellers") || "All Sellers"}
          </option>
          {sellers.map((seller) => (
            <option key={seller._id} value={seller._id}>
              {seller.storeName || `${seller.firstName} ${seller.lastName}`}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">
            {t("adminProducts.allCategories") || "All Categories"}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {getCategoryName(cat)}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">
            {t("adminProducts.allStatus") || "All Status"}
          </option>
          <option value="active">
            {t("adminProducts.active") || "Active"}
          </option>
          <option value="inactive">
            {t("adminProducts.inactive") || "Inactive"}
          </option>
        </select>
      </div>

      {/* Products Table */}
      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.product") || "Product"}
                </th>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.seller") || "Seller"}
                </th>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.category") || "Category"}
                </th>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.price") || "Price"}
                </th>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.stock") || "Stock"}
                </th>
                <th className="px-6 py-3 ltr:text-left rtl:text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.status") || "Status"}
                </th>
                <th className="px-6 py-3 ltr:text-right rtl:text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("adminProducts.table.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-dark-400"
                  >
                    {t("adminProducts.noProducts") || "No products found"}
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-dark-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {product.title}
                          </p>
                          <p className="text-xs text-dark-400">
                            {product.brand ||
                              t("adminProducts.details.noBrand") ||
                              "No brand"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      <div>
                        <p className="text-white text-sm">
                          {getSellerName(product.sellerId)}
                        </p>
                        <p className="text-xs text-dark-400">
                          {product.sellerId?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      <p className="text-white text-sm">
                        {getCategoryName(product.mainCategoryId)}
                      </p>
                      <p className="text-xs text-dark-400">
                        {getCategoryName(product.sellerCategoryId)}
                      </p>
                    </td>

                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      {product.discountPrice &&
                      product.discountPrice < product.price ? (
                        <div>
                          <p className="text-white font-medium">
                            $
                            {formatNumber(
                              product.discountPrice,
                              currentLanguage,
                            )}
                          </p>
                          <p className="text-xs text-dark-400 line-through">
                            ${formatNumber(product.price, currentLanguage)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          ${formatNumber(product.price, currentLanguage)}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      <p
                        className={`text-sm font-medium ${
                          product.quantity === 0 ? "text-red-400" : "text-white"
                        }`}
                      >
                        {formatNumber(product.quantity, currentLanguage)}
                      </p>
                    </td>
                    <td className="px-6 py-4 ltr:text-left rtl:text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {product.isActive ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {product.isActive
                          ? t("adminProducts.active") || "Active"
                          : t("adminProducts.inactive") || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 ltr:text-right rtl:text-left">
                      <div className="flex items-center ltr:justify-end rtl:justify-start gap-2">
                        <button
                          onClick={() =>
                            toggleProductStatus(product._id, product.isActive)
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.isActive
                              ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              : "hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedProductDetails(product)}
                          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              productId: product._id,
                              productTitle: product.title,
                            })
                          }
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal لعرض تفاصيل المنتج عند ضغط العين */}
      <AnimatePresence>
        {selectedProductDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedProductDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary-400" />
                  {selectedProductDetails.title}
                </h3>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-dark-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* معرض الصور */}
              {selectedProductDetails.images?.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedProductDetails.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-28 h-28 rounded-xl border border-white/10 overflow-hidden bg-dark-700 flex-shrink-0"
                    >
                      <img
                        src={img}
                        alt={`${selectedProductDetails.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* التفاصيل الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-dark-400 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    {t("adminProducts.details.seller") || "Seller"}
                  </span>
                  <p className="text-white font-medium">
                    {getSellerName(selectedProductDetails.sellerId)}
                  </p>
                  <p className="text-xs text-dark-400">
                    {selectedProductDetails.sellerId?.email}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-dark-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {t("adminProducts.details.category") || "Category"}
                  </span>
                  <p className="text-white font-medium">
                    {getCategoryName(selectedProductDetails.mainCategoryId)}
                  </p>
                  <p className="text-xs text-dark-400">
                    {getCategoryName(selectedProductDetails.sellerCategoryId)}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-dark-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {t("adminProducts.details.price") || "Price"}
                  </span>

                  {selectedProductDetails.discountPrice &&
                  selectedProductDetails.discountPrice <
                    selectedProductDetails.price ? (
                    <div className="flex items-baseline gap-2">
                      <p className="text-white font-semibold">
                        $
                        {formatNumber(
                          selectedProductDetails.discountPrice,
                          currentLanguage,
                        )}
                      </p>
                      <p className="text-xs text-dark-400 line-through">
                        $
                        {formatNumber(
                          selectedProductDetails.price,
                          currentLanguage,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white font-semibold">
                      $
                      {formatNumber(
                        selectedProductDetails.price,
                        currentLanguage,
                      )}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-dark-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {t("adminProducts.details.brandAndStock") ||
                      "Brand & Stock"}
                  </span>
                  <p className="text-white font-medium">
                    {selectedProductDetails.brand ||
                      t("adminProducts.details.noBrand") ||
                      "No Brand"}{" "}
                    |{" "}
                    {formatNumber(
                      selectedProductDetails.quantity,
                      currentLanguage,
                    )}{" "}
                    {t("adminProducts.details.inStock") || "in stock"}
                  </p>
                </div>
              </div>

              {/* الوصف */}
              {selectedProductDetails.description && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-dark-400">
                    {t("adminProducts.details.description") || "Description"}
                  </h4>
                  <p className="text-sm text-white bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {selectedProductDetails.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, productId: null, productTitle: "" })
        }
        onConfirm={handleDeleteProduct}
        title={t("adminProducts.confirm.deleteTitle") || "Delete Product"}
        message={
          t("adminProducts.confirm.deleteMessage", {
            title: confirmDialog.productTitle,
          }) ||
          `Are you sure you want to delete "${confirmDialog.productTitle}"? This action cannot be undone.`
        }
        confirmText={t("adminProducts.confirm.confirmDelete") || "Yes, Delete"}
        cancelText={
          t("adminProducts.confirm.cancel") || t("common.cancel") || "Cancel"
        }
        type="danger"
        isLoading={loading}
      />
    </div>
  );
};
