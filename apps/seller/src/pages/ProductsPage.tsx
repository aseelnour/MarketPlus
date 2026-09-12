import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatNumber } from "../utils/numbers";
import { useLanguage } from "../hooks/useLanguage";

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

interface MainCategory {
  _id: string;
  name: string;
  nameAr?: string;
}

interface SellerCategory {
  _id: string;
  name: string;
  nameAr?: string;
  mainCategoryId: string;
}

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { seller } = useSellerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let activeStoreId = searchParams.get("storeId");
  if (!activeStoreId || activeStoreId === "null") {
    activeStoreId = localStorage.getItem("lastActiveStoreId");
  }
  if (!activeStoreId || activeStoreId === "null") {
    navigate("/stores");
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("all");
  const [selectedSellerCategory, setSelectedSellerCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [sellerCategories, setSellerCategories] = useState<SellerCategory[]>(
    [],
  );

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productTitle: string;
  }>({
    isOpen: false,
    productId: null,
    productTitle: "",
  });

  const normalizeStoreId = (storeId: string | null) => {
    return storeId && storeId !== "null" ? storeId : null;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/seller/products?storeId=${activeStoreId}`,
      );
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
    const fetchCategories = async () => {
      try {
        const [mainRes, sellerRes] = await Promise.all([
          api.get("/seller/categories/main"),
          api.get(`/seller/categories/seller?storeId=${activeStoreId}`),
        ]);

        if (mainRes.data.success) {
          setMainCategories(mainRes.data.data.categories);
        }
        if (sellerRes.data.success) {
          setSellerCategories(sellerRes.data.data.sellerCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [activeStoreId]);

  useEffect(() => {
    fetchProducts();
  }, [activeStoreId]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesMainCategory =
      selectedMainCategory === "all" ||
      product.mainCategoryId?._id === selectedMainCategory;
    const matchesSellerCategory =
      selectedSellerCategory === "all" ||
      product.sellerCategoryId?._id === selectedSellerCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && product.isActive) ||
      (selectedStatus === "inactive" && !product.isActive);

    return (
      matchesSearch &&
      matchesMainCategory &&
      matchesSellerCategory &&
      matchesStatus
    );
  });

  const handleDeleteProduct = async () => {
    const { productId } = confirmDialog;
    if (!productId) return;

    try {
      const response = await api.delete(
        `/seller/products/${productId}?storeId=${activeStoreId}`,
      );
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
      const response = await api.patch(
        `/seller/products/${productId}/status?storeId=${activeStoreId}`,
        {
          isActive: !currentStatus,
        },
      );
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

  const getMainCategoryName = (product: Product) => {
    
    if (product.mainCategoryId && product.mainCategoryId.name) {
      return product.mainCategoryId.name;
    }
    
    if (typeof product.mainCategoryId === "string") {
      
      const cat = mainCategories.find(
        (c) => c._id === product.mainCategoryId._id,
      );
      return cat?.name || "No Category";
    }
    return "No Category";
  };

  const getSellerCategoryName = (product: Product) => {
    return product.sellerCategoryId?.name || "No Sub-Category";
  };

  const getMainCategoryNameForFilter = (id: string) => {
    const cat = mainCategories.find((c) => c._id === id);
    return cat?.name || id;
  };

  const getSellerCategoryNameForFilter = (id: string) => {
    const cat = sellerCategories.find((c) => c._id === id);
    return cat?.name || id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      { }
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("products.title") || "My Products"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("products.subtitle") ||
              "Manage all your products across all categories"}
          </p>
        </div>
        <button
          onClick={() => navigate(`/add-product?storeId=${activeStoreId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {t("products.addProduct") || "Add Product"}
        </button>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-dark-400">
            {t("products.stats.total") || "Total"}
          </p>
          <p className="text-2xl font-bold text-white">
            {formatNumber(products.length, currentLanguage)}
          </p>
        </div>
        <div className="card p-4 border-emerald-500/30">
          <p className="text-sm text-dark-400">
            {t("products.stats.active") || "Active"}
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
            {t("products.stats.inactive") || "Inactive"}
          </p>
          <p className="text-2xl font-bold text-red-400">
            {formatNumber(
              products.filter((p) => !p.isActive).length,
              currentLanguage,
            )}
          </p>
        </div>
        <div className="card p-4 border-blue-500/30">
          <p className="text-sm text-dark-400">
            {t("products.stats.outOfStock") || "Out of Stock"}
          </p>
          <p className="text-2xl font-bold text-blue-400">
            {formatNumber(
              products.filter((p) => p.quantity === 0).length,
              currentLanguage,
            )}
          </p>
        </div>
      </div>

      { }
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder={t("products.search") || "Search products..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <select
          value={selectedMainCategory}
          onChange={(e) => {
            setSelectedMainCategory(e.target.value);
            setSelectedSellerCategory("all");
          }}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">
            {t("products.allMainCategories") || "All Main Categories"}
          </option>
          {mainCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
            </option>
          ))}
        </select>

        <select
          value={selectedSellerCategory}
          onChange={(e) => setSelectedSellerCategory(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">
            {t("products.allSellerCategories") || "All Your Categories"}
          </option>
          {sellerCategories
            .filter((cat) =>
              selectedMainCategory === "all"
                ? true
                : cat.mainCategoryId === selectedMainCategory,
            )
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
              </option>
            ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">{t("products.allStatus") || "All Status"}</option>
          <option value="active">{t("products.active") || "Active"}</option>
          <option value="inactive">
            {t("products.inactive") || "Inactive"}
          </option>
        </select>

        <button
          onClick={fetchProducts}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      { }
      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.product") || "Product"}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.category") || "Category"}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.price") || "Price"}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.stock") || "Stock"}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.status") || "Status"}
                </th>
                <th className="px-6 py-3 ltr:text-right rtl:text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  {t("products.table.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-dark-400"
                  >
                    {t("products.noProducts") || "No products found"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    { }
                    <td className="px-6 py-4 text-start">
                      <div className="flex items-center gap-3 rtl:flex-row-reverse justify-end rtl:justify-end">
                        <div className="text-end rtl:text-right">
                          <p className="text-white font-medium">
                            {product.title}
                          </p>
                          <p className="text-xs text-dark-400">
                            {product.brand || t("common.noBrand") || "No brand"}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/40?text=No+Image";
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-dark-400" />
                          )}
                        </div>
                      </div>
                    </td>

                    { }
                    <td className="px-6 py-4 text-start">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          {getMainCategoryName(product)}
                        </span>
                        <span className="text-sm text-white font-medium block">
                          {getSellerCategoryName(product)}
                        </span>
                      </div>
                    </td>

                    { }
                    <td className="px-6 py-4 text-start">
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

                    { }
                    <td className="px-6 py-4 text-start">
                      <p
                        className={`text-sm font-medium ${
                          product.quantity === 0 ? "text-red-400" : "text-white"
                        }`}
                      >
                        {formatNumber(product.quantity, currentLanguage)}
                      </p>
                    </td>

                    { }
                    <td className="px-6 py-4 text-start">
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
                          ? t("products.active") || "Active"
                          : t("products.inactive") || "Inactive"}
                      </span>
                    </td>

                    { }
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end rtl:justify-start gap-2">
                        <button
                          onClick={() =>
                            toggleProductStatus(product._id, product.isActive)
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.isActive
                              ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              : "hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={
                            product.isActive
                              ? t("common.deactivate") || "Deactivate"
                              : t("common.activate") || "Activate"
                          }
                        >
                          {product.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            const currentStoreId = normalizeStoreId(
                              searchParams.get("storeId") ||
                                localStorage.getItem("lastActiveStoreId"),
                            );

                            if (!currentStoreId) {
                              toast.error(
                                t("products.selectStoreFirst") ||
                                  "Please select a store first",
                              );
                              return;
                            }

                            navigate(
                              `/products/${product._id}/edit?storeId=${currentStoreId}`,
                            );
                          }}
                          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                          title={t("common.edit") || "Edit"}
                        >
                          <Edit className="w-4 h-4" />
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
                          title={t("common.delete") || "Delete"}
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

      { }
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, productId: null, productTitle: "" })
        }
        onConfirm={handleDeleteProduct}
        title={t("products.deleteProduct")}
        message={t("products.deleteConfirm", {
          title: confirmDialog.productTitle,
        })}
        confirmText={t("products.yesDelete")}
        cancelText={t("common.cancel")}
        type="danger"
        isLoading={loading}
      />
    </div>
  );
};
