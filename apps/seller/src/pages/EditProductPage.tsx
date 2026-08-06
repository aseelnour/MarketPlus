import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";
import { motion } from "framer-motion";
import { formatNumber } from "../utils/numbers";
import {
  ArrowLeft,
  X,
  Plus,
  Package,
  Tag,
  DollarSign,
  Folder,
  Save,
} from "lucide-react";
import { ImageUploadModal } from "../components/ImageUploadModal";

interface MainCategory {
  _id: string;
  name: string;
  nameAr?: string;
}

interface SellerCategory {
  _id: string;
  name: string;
  nameAr?: string;
  mainCategoryId: string | { _id: string };
}

const toEnglishDigits = (str: string | number | undefined | null): string => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) =>
    "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString(),
  );
};

export const EditProductPage: React.FC = () => {
  const { t } = useTranslation();
  const { seller } = useSellerAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [sellerCategories, setSellerCategories] = useState<SellerCategory[]>(
    [],
  );
  const [filteredSellerCategories, setFilteredSellerCategories] = useState<
    SellerCategory[]
  >([]);
  const [showImageModal, setShowImageModal] = useState(false);

  const [formData, setFormData] = useState({
    mainCategoryId: "",
    sellerCategoryId: "",
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    quantity: "",
    brand: "",
    images: [] as string[],
    isActive: true,
  });

  const getCategoryId = (catId: any): string => {
    if (!catId) return "";
    return typeof catId === "object" ? catId._id : catId;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      try {
        setFetching(true);

        const [mainRes, sellerRes, productRes] = await Promise.all([
          api.get("/seller/categories/main"),
          api.get("/seller/categories/seller"),
          api.get(`/seller/products/${id}`),
        ]);

        let fetchedMainCats: MainCategory[] = [];
        let fetchedSellerCats: SellerCategory[] = [];

        if (mainRes.data.success) {
          fetchedMainCats = mainRes.data.data.categories || [];
          setMainCategories(fetchedMainCats);
        }

        if (sellerRes.data.success) {
          fetchedSellerCats = sellerRes.data.data.sellerCategories || [];
          setSellerCategories(fetchedSellerCats);
        }

        if (productRes.data.success) {
          const product = productRes.data.data.product;

          const mainCategoryId = getCategoryId(product.mainCategoryId);
          const sellerCategoryId = getCategoryId(product.sellerCategoryId);

          setFormData({
            mainCategoryId: mainCategoryId || "",
            sellerCategoryId: sellerCategoryId || "",
            title: product.title || "",
            description: product.description || "",
            price: toEnglishDigits(product.price),
            discountPrice: toEnglishDigits(product.discountPrice),
            quantity: toEnglishDigits(product.quantity),
            brand: product.brand || "",
            images: product.images || [],
            isActive: product.isActive ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        toast.error("Failed to load product data");
        navigate("/products");
      } finally {
        setFetching(false);
      }
    };

    loadInitialData();
  }, [id, navigate]);

  useEffect(() => {
    if (formData.mainCategoryId && sellerCategories.length > 0) {
      const filtered = sellerCategories.filter(
        (cat) => getCategoryId(cat.mainCategoryId) === formData.mainCategoryId,
      );
      setFilteredSellerCategories(filtered);
    } else {
      setFilteredSellerCategories([]);
    }
  }, [formData.mainCategoryId, sellerCategories]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "mainCategoryId") {
      setFormData((prev) => ({
        ...prev,
        mainCategoryId: value,
        sellerCategoryId: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

    if (!formData.mainCategoryId) {
      toast.error("Please select a main category");
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
      const response = await api.put(`/seller/products/${id}`, {
        mainCategoryId: formData.mainCategoryId,
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
        isActive: formData.isActive,
      });

      if (response.data.success) {
        toast.success("Product updated successfully! 🎉");
        navigate("/products");
      }
    } catch (error: any) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/products")}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-dark-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("products.editProduct") || "Edit Product"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("products.editProductDesc") || "Update your product details"}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.mainCategory") || "Main Category"} *
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                <select
                  name="mainCategoryId"
                  value={formData.mainCategoryId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  required
                >
                  <option value="">
                    {t("dashboard.selectMainCategory") ||
                      "Select main category..."}
                  </option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.sellerCategory") || "Your Category"} *
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                <select
                  name="sellerCategoryId"
                  value={formData.sellerCategoryId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  required
                  disabled={!formData.mainCategoryId}
                >
                  <option value="">
                    {formData.mainCategoryId
                      ? t("dashboard.selectSellerCategory") ||
                        "Select your category..."
                      : t("dashboard.selectMainFirst") ||
                        "Select main category first"}
                  </option>
                  {filteredSellerCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.nameAr ? `(${cat.nameAr})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {filteredSellerCategories.length === 0 &&
                formData.mainCategoryId && (
                  <p className="mt-1 text-xs text-yellow-400">
                    {t("dashboard.noSellerCategories") ||
                      "No categories found. Create one first!"}
                  </p>
                )}
            </div>
          </div>

          {/* Product Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              {t("dashboard.productTitle") || "Product Title"} *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
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

          {/* Description */}
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

          {/* Pricing & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.price") || "Price"} *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  inputMode="decimal"
                  name="price"
                  value={
                    formData.price !== "" && !isNaN(Number(formData.price))
                      ? formatNumber(Number(formData.price), currentLanguage)
                      : formData.price
                  }
                  onChange={(e) => {
                    const val = toEnglishDigits(e.target.value);
                    if (/^\d*\.?\d*$/.test(val)) {
                      setFormData((prev) => ({ ...prev, price: val }));
                    }
                  }}
                  placeholder={formatNumber(99.99, currentLanguage)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.discountPrice") || "Discount Price"}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  inputMode="decimal"
                  name="discountPrice"
                  value={
                    formData.discountPrice !== "" &&
                    !isNaN(Number(formData.discountPrice))
                      ? formatNumber(
                          Number(formData.discountPrice),
                          currentLanguage,
                        )
                      : formData.discountPrice
                  }
                  onChange={(e) => {
                    const val = toEnglishDigits(e.target.value);
                    if (/^\d*\.?\d*$/.test(val)) {
                      setFormData((prev) => ({ ...prev, discountPrice: val }));
                    }
                  }}
                  placeholder={formatNumber(79.99, currentLanguage)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("dashboard.quantity") || "Quantity"} *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  name="quantity"
                  value={
                    formData.quantity !== "" &&
                    !isNaN(Number(formData.quantity))
                      ? formatNumber(Number(formData.quantity), currentLanguage)
                      : formData.quantity
                  }
                  onChange={(e) => {
                    const val = toEnglishDigits(e.target.value);
                    if (/^\d*$/.test(val)) {
                      setFormData((prev) => ({ ...prev, quantity: val }));
                    }
                  }}
                  placeholder={formatNumber(10, currentLanguage)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-left"
                  required
                />
              </div>
            </div>
          </div>

          {/* Brand */}
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

          {/* Active Checkbox */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-dark-600 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-dark-300">
                {t("products.active") || "Active"}
              </span>
            </label>
          </div>

          {/* Images */}
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("common.loading") || "Updating..."}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("products.updateProduct") || "Update Product"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors font-medium"
            >
              {t("common.cancel") || "Cancel"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onAdd={handleImageAdd}
      />
    </div>
  );
};
