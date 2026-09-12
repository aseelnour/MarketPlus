import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Tag,
  FileText,
  Globe,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "../components/confirm-dialog";

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    icon: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    categoryId: string | null;
  }>({
    isOpen: false,
    categoryId: null,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/categories");
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error(t("categories.fetchError") || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.nameAr && cat.nameAr.includes(search)),
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", nameAr: "", icon: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameAr: category.nameAr || "",
      icon: category.icon || "",
      description: category.description || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        const response = await api.put(
          `/admin/categories/${editingCategory._id}`,
          formData,
        );
        if (response.data.success) {
          toast.success(
            t("categories.updateSuccess") || "Category updated successfully!",
          );
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const response = await api.post("/admin/categories/store", formData);
        if (response.data.success) {
          toast.success(
            t("categories.addSuccess") || "Category added successfully!",
          );
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (error: any) {
      console.error("Failed to save category:", error);
      toast.error(
        error.response?.data?.message ||
          t("categories.saveError") ||
          "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.categoryId) return;
    try {
      const response = await api.delete(
        `/admin/categories/${confirmDialog.categoryId}`,
      );
      if (response.data.success) {
        toast.success(
          t("categories.deleteSuccess") || "Category deleted successfully!",
        );
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(t("categories.deleteError") || "Failed to delete category");
    } finally {
      setConfirmDialog({ isOpen: false, categoryId: null });
    }
  };

  return (
    <div className="space-y-6">
      { }
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("categories.title") || "Categories Management"}
          </h1>
          <p className="text-dark-400 mt-1">
            {t("categories.subtitle") ||
              "Manage main categories for the marketplace"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-dark-400" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            {t("categories.add") || "Add Category"}
          </button>
        </div>
      </div>

      { }
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("categories.search") || "Search categories..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
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
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t("categories.table.name") || "Name"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t("categories.table.nameAr") || "Arabic Name"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t("categories.table.description") || "Description"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t("categories.table.status") || "Status"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t("common.actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-dark-400"
                      >
                        {t("categories.noCategories") || "No categories found"}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category, index) => (
                      <motion.tr
                        key={category._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td
                          className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              {category.icon ? (
                                <span className="text-lg">{category.icon}</span>
                              ) : (
                                <Tag className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <span className="text-white font-medium">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <span className="text-dark-300">
                            {category.nameAr || "-"}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <span className="text-dark-400 text-sm truncate max-w-[200px] block">
                            {category.description || "-"}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${category.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""} ${isRTL ? "justify-start" : "justify-end"}`}
                          >
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                              title={t("common.edit") || "Edit"}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  categoryId: category._id,
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
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      { }
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingCategory
                    ? t("categories.edit") || "Edit Category"
                    : t("categories.add") || "Add New Category"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-dark-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    {t("categories.form.name") || "Name (English)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Electronics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    {t("categories.form.nameAr") || "Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="إلكترونيات"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    {t("categories.form.icon") || "Icon (Emoji)"}
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="📱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    {t("categories.form.description") || "Description"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Describe this category..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
                  >
                    {t("common.cancel") || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("common.saving") || "Saving..."}
                      </>
                    ) : editingCategory ? (
                      t("common.update") || "Update"
                    ) : (
                      t("common.save") || "Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      { }
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, categoryId: null })}
        onConfirm={handleDelete}
        title={t("categories.deleteTitle") || "Delete Category"}
        message={
          t("categories.deleteMessage") ||
          "Are you sure you want to delete this category? This action cannot be undone."
        }
        confirmText={t("common.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        type="danger"
        isLoading={loading}
      />
    </div>
  );
};
