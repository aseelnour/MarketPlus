import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError(t("dashboard.imageUrlError") || "Please enter an image URL");
      return;
    }

    try {
      new URL(url);
      onAdd(url.trim());
      setUrl("");
      setError("");
      onClose();
    } catch {
      setError(t("dashboard.imageUrlInvalid") || "Please enter a valid URL");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t("dashboard.addImage") || "Add Image"}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  {t("dashboard.imageUrl") || "Image URL"}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    t("dashboard.imageUrlPlaceholder") ||
                    "https://example.com/image.jpg"
                  }
                  className="w-full px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                />
                {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t("common.add") || "Add"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors font-medium"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
