import React, { useEffect, useState } from "react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { api } from "../services/api";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
}

export const StoresPage: React.FC = () => {
  const { t } = useTranslation();
  const { seller } = useSellerAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/stores");
      setStores(res.data.data.stores || []);
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
    setForm({ name: "", slug: "", description: "", category: "" });
  };

  const startEdit = (s: Store) => {
    setEditing(s);
    setForm({
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      category: s.category || "",
    });
  };

  const submit = async () => {
    try {
      if (editing) {
        const res = await api.put(`/seller/stores/${editing._id}`, form);
        console.log(res.data);
      } else {
        const res = await api.post(`/seller/stores`, form);
        console.log(res.data);
      }
      await load();
      setEditing(null);
    } catch (err) {
      console.error("Save store failed", err);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("stores.confirmDelete") || "Are you sure?")) return;
    try {
      await api.delete(`/seller/stores/${id}`);
      await load();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {t("stores.title") || "Your Stores"}
        </h2>
        <div>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-emerald-500 rounded text-white"
          >
            {t("stores.new") || "New Store"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-3">
            {t("stores.list") || "Stores"}
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {stores.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded"
                >
                  <div>
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-sm text-dark-400">{s.category}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-3 py-1 bg-blue-500 rounded text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(s._id)}
                      className="px-3 py-1 bg-red-500 rounded text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-3">
            {editing ? t("stores.edit") : t("stores.create") || "Create / Edit"}
          </h3>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 rounded bg-white/5"
              placeholder={t("stores.name") || "Name"}
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full p-2 rounded bg-white/5"
              placeholder={t("stores.slug") || "Slug"}
            />
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-2 rounded bg-white/5"
              placeholder={t("stores.category") || "Category"}
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 rounded bg-white/5"
              placeholder={t("stores.description") || "Description"}
            />
            <div className="flex gap-2">
              <button
                onClick={submit}
                className="px-4 py-2 bg-emerald-500 rounded text-white"
              >
                {t("stores.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: "",
                    slug: "",
                    description: "",
                    category: "",
                  });
                }}
                className="px-4 py-2 bg-white/5 rounded text-white"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoresPage;
