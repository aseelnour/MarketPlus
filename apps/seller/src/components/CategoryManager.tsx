import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Folder } from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { ConfirmDialog } from "./ConfirmDialog";
interface MainCategory {
  _id: string;
  name: string;
  nameAr?: string;
}

interface SellerCategory {
  _id: string;
  name: string;
  nameAr?: string;
  mainCategoryId: MainCategory | string;
  isActive: boolean;
  products: string[];
}

interface CategoryManagerProps {
  sellerCategories: SellerCategory[];
  onUpdate: (categories: SellerCategory[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  sellerCategories,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { seller } = useSellerAuth();
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedCategoryNameAr, setSelectedCategoryNameAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    categoryId: string | null;
  }>({
    isOpen: false,
    categoryId: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const mainRes = await api.get("/seller/categories/main");
        if (mainRes.data.success) {
          setMainCategories(mainRes.data.data.categories);
        }

        const sellerRes = await api.get("/seller/categories/seller");
        console.log("📊 Seller Categories Data:", sellerRes.data);
        if (sellerRes.data.success) {
          const fetched = sellerRes.data.data.sellerCategories || [];
          setCategories(fetched);
          onUpdate(fetched);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load categories");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sellerCategories && sellerCategories.length > 0) {
      setCategories(sellerCategories);
    }
  }, [sellerCategories]);

  const allowedMainCategories = mainCategories.filter((cat) =>
    seller?.categories?.includes(cat.name),
  );

  const handleAddCategory = async () => {
    if (!selectedMainCategory) {
      toast.error("Please select a main category");
      return;
    }

    if (!selectedCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/seller/categories/seller", {
        mainCategoryId: selectedMainCategory,
        name: selectedCategoryName.trim(),
        nameAr: selectedCategoryNameAr.trim() || undefined,
      });

      if (response.data.success) {
        const newCategory = response.data.data.sellerCategory;
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        onUpdate(updatedCategories);
        toast.success("Category added successfully!");
        setSelectedMainCategory("");
        setSelectedCategoryName("");
        setSelectedCategoryNameAr("");
        setIsAdding(false);
      }
    } catch (error: any) {
      console.error("❌ Add category error:", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    setConfirmDialog({ isOpen: true, categoryId });
  };
  const handleConfirmDelete = async () => {
    const { categoryId } = confirmDialog;
    if (!categoryId) return;

    setLoading(true);
    try {
      const response = await api.delete(
        `/seller/categories/seller/${categoryId}`,
      );

      if (response.data.success) {
        const updatedCategories = categories.filter(
          (c) => c._id !== categoryId,
        );
        setCategories(updatedCategories);
        onUpdate(updatedCategories);
        toast.success("Category removed successfully!");
      }
    } catch (error: any) {
      console.error("❌ Remove category error:", error);
      toast.error(error.response?.data?.message || "Failed to remove category");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, categoryId: null });
    }
  };

  const getMainCategoryName = (
    mainCategoryId: string | MainCategory,
  ): string => {
    if (typeof mainCategoryId === "string") {
      const found = mainCategories.find((mc) => mc._id === mainCategoryId);
      return found?.name || mainCategoryId;
    }
    return mainCategoryId?.name || "Unknown";
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="ml-3 text-dark-400 text-sm">
          Loading categories...
        </span>
      </div>
    );
  }

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <>
      <div className="space-y-4">
        {/* Current Categories */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {t("dashboard.sellerCategories") || "Your Categories"}
          </label>
          <div className="space-y-2">
            {displayCategories.length > 0 ? (
              displayCategories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">{category.name}</p>
                      <p className="text-xs text-dark-400">
                        {t("categories.main") || "Main"}:{" "}
                        {getMainCategoryName(category.mainCategoryId)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCategory(category._id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 text-center">
                <p className="text-dark-400 text-sm">
                  {t("common.noCategories") || "No categories added yet"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Category Button */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("dashboard.addCategory") || "Add Category"}
          </button>
        ) : (
          <div className="bg-dark-800/50 p-4 rounded-xl border border-dark-700 space-y-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.mainCategory") || "Main Category"}
              </label>
              <select
                value={selectedMainCategory}
                onChange={(e) => setSelectedMainCategory(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              >
                <option value="">
                  {t("dashboard.selectMainCategory") ||
                    "Select a main category..."}
                </option>
                {allowedMainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                  </option>
                ))}
              </select>
              {allowedMainCategories.length === 0 && (
                <p className="mt-1 text-xs text-yellow-400">
                  {t("dashboard.noAllowedCategories") ||
                    "You don't have any main categories assigned. Contact admin."}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.categoryName") || "Category Name"}
              </label>
              <input
                type="text"
                value={selectedCategoryName}
                onChange={(e) => setSelectedCategoryName(e.target.value)}
                placeholder="e.g. Smartphones"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.categoryNameAr") ||
                  "Category Name (Arabic) (Optional)"}
              </label>
              <input
                type="text"
                value={selectedCategoryNameAr}
                onChange={(e) => setSelectedCategoryNameAr(e.target.value)}
                placeholder="مثال: هواتف ذكية"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCategory}
                disabled={loading}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t("common.add") || "Add"
                )}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSelectedMainCategory("");
                  setSelectedCategoryName("");
                  setSelectedCategoryNameAr("");
                }}
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors text-sm"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, categoryId: null })}
        onConfirm={handleConfirmDelete}
        title={t("sellers.confirm.delete.title") || "Delete Category"}
        message={
          t("sellers.confirm.delete.message") ||
          "Are you sure you want to delete this category? This action cannot be undone."
        }
        confirmText={t("sellers.confirm.delete.confirm") || "Yes, Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        type="danger"
        isLoading={loading}
      />
    </>
  );
};
