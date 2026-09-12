
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  X,
  Plus,
  Package,
  Tag,
  DollarSign,
  Folder,
  Image,
} from "lucide-react";
import { ImageUploadModal } from "../components/ImageUploadModal";

interface MainCategory {
  _id: string;
  name: string;
  nameAr?: string;
  storeCategoryId?: string;
}

interface StoreCategory {
  _id: string;
  name: string;
  nameAr?: string;
}

interface SellerCategory {
  _id: string;
  name: string;
  nameAr?: string;
  mainCategoryId: string | { _id: string; name?: string; nameAr?: string };
}

export const AddProductPage: React.FC = () => {
  const { t } = useTranslation();
  const { seller } = useSellerAuth();
  const navigate = useNavigate();

  const activeStoreId = localStorage.getItem("lastActiveStoreId");

  const [loading, setLoading] = useState(false);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [filteredMainCategories, setFilteredMainCategories] = useState<
    MainCategory[]
  >([]);
  const [sellerCategories, setSellerCategories] = useState<SellerCategory[]>(
    [],
  );
  const [filteredSellerCategories, setFilteredSellerCategories] = useState<
    SellerCategory[]
  >([]);
  const [showImageModal, setShowImageModal] = useState(false);

  const [formData, setFormData] = useState({
    storeCategoryId: "",
    mainCategoryId: "",
    sellerCategoryId: "",
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    quantity: "",
    brand: "",
    images: [] as string[],
  });

  useEffect(() => {
    const fetchStoreCategories = async () => {
      if (!activeStoreId || activeStoreId === "null") {
        console.warn("No active store ID");
        return;
      }

      try {
        
        const storeRes = await api.get(`/seller/stores/${activeStoreId}`);
        if (storeRes.data.success) {
          const store = storeRes.data.data.store;
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
        toast.error("Failed to load store categories");
      }
    };
    fetchStoreCategories();
  }, [activeStoreId]);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const response = await api.get("/seller/categories/main");
        if (response.data.success) {
          setMainCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch main categories:", error);
        toast.error("Failed to load categories");
      }
    };
    fetchMainCategories();
  }, []);

  useEffect(() => {
    const fetchSellerCategories = async () => {
      if (!activeStoreId || activeStoreId === "null") return;

      try {
        const response = await api.get(
          `/seller/categories/seller?storeId=${activeStoreId}`,
        );
        if (response.data.success) {
          setSellerCategories(response.data.data.sellerCategories || []);
        }
      } catch (error) {
        console.error("Failed to fetch seller categories:", error);
      }
    };
    fetchSellerCategories();
  }, [activeStoreId]);

  useEffect(() => {
    if (formData.storeCategoryId) {
      const filtered = sellerCategories.filter((cat) => {
        const mainCatId =
          typeof cat.mainCategoryId === "object"
            ? cat.mainCategoryId._id
            : cat.mainCategoryId;
        return mainCatId === formData.storeCategoryId;
      });
      setFilteredSellerCategories(filtered);
      setFormData((prev) => ({ ...prev, sellerCategoryId: "" }));
    } else {
      setFilteredSellerCategories([]);
    }
  }, [formData.storeCategoryId, sellerCategories]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageAdd = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeStoreId || activeStoreId === "null") {
      toast.error(
        "No active store selected. Please go to Stores and enter a store.",
      );
      navigate("/stores");
      return;
    }

    if (!formData.storeCategoryId) {
      toast.error("Please select a store category");
      return;
    }
    if (!formData.sellerCategoryId) {
      toast.error("Please select a seller category");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a product title");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/seller/products", {
        storeId: activeStoreId,
        storeCategoryId: formData.storeCategoryId,
        sellerCategoryId: formData.sellerCategoryId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : undefined,
        quantity: parseInt(formData.quantity),
        brand: formData.brand.trim() || undefined,
        images:
          formData.images.length > 0 ? formData.images : ["placeholder.jpg"],
      });

      if (response.data.success) {
        toast.success("Product added successfully! 🎉");
        navigate(`/dashboard?storeId=${activeStoreId}`);
      }
    } catch (error: any) {
      console.error("Add product error:", error);
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      { }
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/dashboard?storeId=${activeStoreId}`)}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-dark-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("dashboard.addProduct") || "Add Product"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("dashboard.addProductDesc") || "Add a new product to your store"}
          </p>
        </div>
      </div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          { }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            { }
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Store Category *
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <select
                  name="storeCategoryId"
                  value={formData.storeCategoryId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  required
                >
                  <option value="">Select Store Category...</option>
                  {storeCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {storeCategories.length === 0 && (
                <p className="mt-1 text-xs text-yellow-400">
                  No store categories available for this store.
                </p>
              )}
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                Your Category *
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <select
                  name="sellerCategoryId"
                  value={formData.sellerCategoryId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  required
                  disabled={!formData.storeCategoryId}
                >
                  <option value="">
                    {formData.storeCategoryId
                      ? "Select your category..."
                      : "Select store category first"}
                  </option>
                  {filteredSellerCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {filteredSellerCategories.length === 0 &&
                formData.storeCategoryId && (
                  <p className="mt-1 text-xs text-yellow-400">
                    No sub-categories found. Create one in Dashboard first!
                  </p>
                )}
            </div>
          </div>

          { }
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              {t("dashboard.productTitle") || "Product Title"} *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={
                  t("dashboard.productTitlePlaceholder") || "e.g. iPhone 15 Pro"
                }
                className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          { }
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              {t("dashboard.description") || "Description"}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={
                t("dashboard.descriptionPlaceholder") ||
                "Describe your product..."
              }
              className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          { }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.price") || "Price"} *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99.99"
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.discountPrice") || "Discount Price"}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="79.99"
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.quantity") || "Quantity"} *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          { }
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              {t("dashboard.brand") || "Brand"}
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder={t("dashboard.brandPlaceholder") || "e.g. Apple"}
              className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          { }
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              {t("dashboard.images") || "Images"}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-dark-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/80?text=No+Image";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 p-0.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="w-20 h-20 border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center hover:border-emerald-500/50 transition-colors"
              >
                <Plus className="w-6 h-6 text-dark-400" />
              </button>
            </div>
            <p className="text-xs text-dark-400">
              {t("dashboard.imagesHint") ||
                "Add image URLs (you can add multiple)"}
            </p>
          </div>

          { }
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("common.loading") || "Adding..."}
                </div>
              ) : (
                t("dashboard.addProduct") || "Add Product"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard?storeId=${activeStoreId}`)}
              className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors font-medium"
            >
              {t("common.cancel") || "Cancel"}
            </button>
          </div>
        </form>
      </motion.div>

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onAdd={handleImageAdd}
      />
    </div>
  );
};
