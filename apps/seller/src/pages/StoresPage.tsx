import React, { useEffect, useState } from "react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { api, getImageUrl } from "../services/apiClient";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Store,
  Upload,
  X,
  Image,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useNavigate } from "react-router-dom";

interface StoreData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  categories?: string[];
  logo?: string;
  storeCategoryIds?: string[];
  coverImage?: string;
  isActive?: boolean;
  isVerified?: boolean;
  status?: "pending" | "active" | "rejected";
}

interface StoreCategory {
  _id: string;
  name: string;
  nameAr?: string;
}

export const StoresPage: React.FC = () => {
  const { t } = useTranslation();
  const { seller } = useSellerAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StoreData | null>(null);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    storeCategoryIds: [] as string[],
    logoFile: null as File | null,
    coverFile: null as File | null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    storeId: string | null;
    storeName: string;
  }>({
    isOpen: false,
    storeId: null,
    storeName: "",
  });

  useEffect(() => {
    const fetchStoreCategories = async () => {
      try {
        const response = await api.get("/seller/categories/store");
        if (response.data.success) {
          setStoreCategories(response.data.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch store categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchStoreCategories();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/stores");
      const storesData = res.data?.data?.stores || [];
      setStores(storesData);
    } catch (err) {
      console.error("Failed to load stores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      category: "",
      storeCategoryIds: [],
      logoFile: null,
      coverFile: null,
    });
  };

  const startEdit = (s: StoreData) => {
    setEditing(s);
    setForm({
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      category: s.category || "",
      storeCategoryIds: s.storeCategoryIds || [],
      logoFile: null,
      coverFile: null,
    });
  };

  const submit = async () => {
    try {
      const generatedSlug = form.slug.trim()
        ? form.slug.trim()
        : form.name.trim().toLowerCase().replace(/\s+/g, "-");

      const payload = {
        name: form.name,
        slug: generatedSlug,
        description: form.description,
        category: form.category,
        storeCategoryIds: form.storeCategoryIds,
      };

      if (!payload.name || payload.storeCategoryIds.length === 0) {
        toast.error(
          "Please fill in the store name and select at least one store category.",
        );
        return;
      }

      let res;
      let createdStoreId: string | null = null;

      if (editing) {
        res = await api.put(`/seller/stores/${editing._id}`, payload);
        createdStoreId = editing._id;
        toast.success(t("stores.updateSuccess") || "Store update requested.");
      } else {
        res = await api.post(`/seller/stores`, payload);

        createdStoreId = res.data?.data?.store?._id || res.data?.store?._id;
        toast.success(
          t("stores.createSuccess") || "Store created successfully!",
        );
      }

      if (createdStoreId && (form.logoFile || form.coverFile)) {
        const imageData = new FormData();
        if (form.logoFile) imageData.append("logo", form.logoFile);
        if (form.coverFile) imageData.append("coverImage", form.coverFile);

        await api.put(`/seller/stores/${createdStoreId}/images`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setEditing(null);
      await load();
    } catch (err: any) {
      console.error("Save store failed", err);
      toast.error(
        err.response?.data?.message ||
          t("stores.saveError") ||
          "Failed to save store",
      );
    }
  };

  const remove = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      storeId: id,
      storeName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.storeId) return;
    try {
      await api.delete(`/seller/stores/${deleteDialog.storeId}`);
      toast.success(t("stores.deleteSuccess") || "Store deleted.");
      setDeleteDialog({ isOpen: false, storeId: null, storeName: "" });
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(t("stores.deleteError") || "Failed to delete store.");
    }
  };

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {t("stores.title") || "Your Stores"}
        </h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
        >
          {t("stores.new") || "New Store"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {t("stores.list") || "My Stores"}
            </h3>
            <button onClick={load} className="p-1 hover:bg-white/10 rounded">
              <RefreshCw className="w-4 h-4 text-dark-400" />
            </button>
          </div>
          {loading ? (
            <div className="text-dark-400">Loading...</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {stores.length === 0 ? (
                <p className="text-dark-400 text-center py-4">
                  {t("stores.noStores") || "No stores yet."}
                </p>
              ) : (
                stores.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-start justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {s.logo ? (
                          <img
                            src={getImageUrl(s.logo)}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{s.name}</div>
                        <div className="text-xs text-dark-400">
                          {s.category || t("stores.noCategory") || "General"}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {s.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3" />
                              {t("stores.active") || "Active"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                              <Clock className="w-3 h-3" />
                              {t("stores.pending") || "Awaiting Approval"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {s.isActive && (
                        <button
                          onClick={() =>
                            navigate(`/dashboard?storeId=${s._id}`)
                          }
                          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors text-xs flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {t("stores.enter") || "Enter"}
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(s)}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs"
                      >
                        {t("common.edit") || "Edit"}
                      </button>
                      <button
                        onClick={() => remove(s._id, s.name)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-xs"
                      >
                        {t("common.delete") || "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-3">
            {editing
              ? t("stores.edit")
              : t("stores.create") || "Create / Edit Store"}
          </h3>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-dark-400 focus:outline-none focus:border-emerald-500/50"
              placeholder={t("stores.name") || "Store Name"}
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-dark-400 focus:outline-none focus:border-emerald-500/50"
              placeholder={t("stores.slug") || "Slug (URL)"}
            />
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-300 block">
                {t("stores.category") ||
                  "Store Categories (Select at least one)"}
              </label>

              {}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                {storeCategories.length === 0 ? (
                  <p className="col-span-full text-center text-dark-400 text-sm py-4">
                    No categories available
                  </p>
                ) : (
                  storeCategories.map((cat) => {
                    const isSelected = form.storeCategoryIds.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-dark-800/50 border-dark-700 hover:border-emerald-500/30 text-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                storeCategoryIds: [
                                  ...form.storeCategoryIds,
                                  cat._id,
                                ],
                              });
                            } else {
                              setForm({
                                ...form,
                                storeCategoryIds: form.storeCategoryIds.filter(
                                  (id) => id !== cat._id,
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-dark-600 text-emerald-500 focus:ring-emerald-500/50 accent-emerald-500"
                        />
                        <span className="text-sm font-medium">
                          {cat.name}
                          {cat.nameAr && (
                            <span className="text-xs text-dark-400 ml-1">
                              ({cat.nameAr})
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {}
              {form.storeCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.storeCategoryIds.map((id) => {
                    const cat = storeCategories.find((c) => c._id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30"
                      >
                        {cat?.name || id}
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              storeCategoryIds: form.storeCategoryIds.filter(
                                (item) => item !== id,
                              ),
                            });
                          }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-dark-400 mt-1">
                {form.storeCategoryIds.length === 0
                  ? t("stores.selectCategory")
                  : t("stores.categoriesSelected", {
                      count: form.storeCategoryIds.length,
                    })}
              </p>
            </div>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-dark-400 focus:outline-none focus:border-emerald-500/50"
              placeholder={t("stores.description") || "Description"}
              rows={3}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-dark-400">
                {t("stores.logo") || "Store Logo"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, logoFile: e.target.files?.[0] || null })
                  }
                  className="hidden"
                  id="logoInput"
                />
                <label
                  htmlFor="logoInput"
                  className="flex-1 cursor-pointer flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Upload className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-400">
                    {form.logoFile
                      ? form.logoFile.name
                      : t("stores.uploadLogo") || "Choose Logo"}
                  </span>
                  {form.logoFile && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setForm({ ...form, logoFile: null });
                      }}
                      className="ml-auto text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-dark-400">
                {t("stores.coverImage") || "Cover Image"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, coverFile: e.target.files?.[0] || null })
                  }
                  className="hidden"
                  id="coverInput"
                />
                <label
                  htmlFor="coverInput"
                  className="flex-1 cursor-pointer flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Image className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-400">
                    {form.coverFile
                      ? form.coverFile.name
                      : t("stores.uploadCover") || "Choose Cover"}
                  </span>
                  {form.coverFile && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setForm({ ...form, coverFile: null });
                      }}
                      className="ml-auto text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={submit}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
              >
                {t("stores.save") || "Save Store"}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: "",
                    slug: "",
                    description: "",
                    category: "",
                    storeCategoryIds: [],
                    logoFile: null,
                    coverFile: null,
                  });
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, storeId: null, storeName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title={t("stores.confirmDeleteTitle") || "Delete Store"}
        message={
          t("stores.confirmDeleteMessage", { name: deleteDialog.storeName }) ||
          `Are you sure you want to delete "${deleteDialog.storeName}"?`
        }
        confirmText={t("common.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        type="danger"
      />
    </div>
  );
};

export default StoresPage;
