import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Folder } from "lucide-react";
import { api } from "../services/apiClient";
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

  const activeStoreId = localStorage.getItem("lastActiveStoreId");

  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [storeCategories, setStoreCategories] = useState<MainCategory[]>([]);
  const [selectedStoreCategory, setSelectedStoreCategory] = useState("");
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
    const fetchStoreCategories = async () => {
      try {
        const res = await api.get(`/seller/stores/${activeStoreId}`);
        if (res.data.success) {
          const store = res.data.data.store;
          const categoryIds = store.storeCategoryIds || [];

          const categoriesRes = await api.get("/seller/categories/store");
          if (categoriesRes.data.success) {
            const allCategories = categoriesRes.data.data.categories || [];
            const filtered = allCategories.filter((cat: any) =>
              categoryIds.includes(cat._id),
            );
            setStoreCategories(filtered);
          }
        }
      } catch (error) {
        console.error("Failed to fetch store categories:", error);
      }
    };

    if (activeStoreId && activeStoreId !== "null") {
      fetchStoreCategories();
    }
  }, [activeStoreId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const sellerRes = await api.get(
          `/seller/categories/seller?storeId=${activeStoreId}`,
        );
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

    if (activeStoreId && activeStoreId !== "null") {
      fetchData();
    } else {
      toast.error("No active store selected.");
      setFetching(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    if (sellerCategories && sellerCategories.length > 0) {
      setCategories(sellerCategories);
    }
  }, [sellerCategories]);

  const handleAddCategory = async () => {
    if (!selectedStoreCategory) {
      toast.error("Please select a store category");
      return;
    }

    if (!selectedCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!activeStoreId || activeStoreId === "null") {
      toast.error("No active store selected.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/seller/categories/seller", {
        storeId: activeStoreId,
        mainCategoryId: selectedStoreCategory,
        name: selectedCategoryName.trim(),
        nameAr: selectedCategoryNameAr.trim() || undefined,
      });

      if (response.data.success) {
        const newCategory = response.data.data.sellerCategory;
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        onUpdate(updatedCategories);
        toast.success("Category added successfully!");
        setSelectedStoreCategory("");
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
        `/seller/categories/seller/${categoryId}?storeId=${activeStoreId}`,
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
      const found = storeCategories.find((mc) => mc._id === mainCategoryId);
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
        {}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {t("categoryManager.yourCategories")}
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
                        {t("categoryManager.mainCategory")}:{" "}
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
                  {t("common.noCategories")}
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("categories.add")}
          </button>
        ) : (
          <div className="bg-dark-800/50 p-4 rounded-xl border border-dark-700 space-y-3">
            {}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("categoryManager.storeCategory")}
              </label>
              <select
                value={selectedStoreCategory}
                onChange={(e) => setSelectedStoreCategory(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              >
                <option value="">
                  {t("categoryManager.selectStoreCategory")}
                </option>
                {storeCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                  </option>
                ))}
              </select>
              {storeCategories.length === 0 && (
                <p className="mt-1 text-xs text-yellow-400">
                  {t("categoryManager.noStoreCategories")}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("categoryManager.categoryName")}
              </label>
              <input
                type="text"
                value={selectedCategoryName}
                onChange={(e) => setSelectedCategoryName(e.target.value)}
                placeholder={t("categoryManager.placeholderName")}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("categoryManager.categoryNameAr")}
              </label>
              <input
                type="text"
                value={selectedCategoryNameAr}
                onChange={(e) => setSelectedCategoryNameAr(e.target.value)}
                placeholder={t("categoryManager.placeholderNameAr")}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCategory}
                disabled={
                  loading ||
                  !selectedStoreCategory ||
                  !selectedCategoryName.trim()
                }
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t("common.add")
                )}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSelectedStoreCategory("");
                  setSelectedCategoryName("");
                  setSelectedCategoryNameAr("");
                }}
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors text-sm"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, categoryId: null })}
        onConfirm={handleConfirmDelete}
        title={t("categories.deleteTitle")}
        message={t("categories.deleteMessage")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        type="danger"
        isLoading={loading}
      />
    </>
  );
};
