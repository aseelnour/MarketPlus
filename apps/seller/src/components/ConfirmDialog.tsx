import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "danger",
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          button: "bg-red-500 hover:bg-red-600",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          button: "bg-yellow-500 hover:bg-yellow-600",
        };
      default:
        return {
          icon: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          button: "bg-blue-500 hover:bg-blue-600",
        };
    }
  };

  const styles = getTypeStyles();

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
            { }
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${styles.bg} ${styles.border}`}>
                  <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {title || t("common.confirm") || "تأكيد الإجراء"}
                  </h3>
                  <p className="text-sm text-dark-400">
                    {message ||
                      t("common.confirmMessage") ||
                      "هل أنت تأكد؟ لا يمكن التراجع عن هذا الإجراء."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            { }
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {cancelText || t("common.cancel") || "إلغاء"}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${styles.button} disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("common.loading") || "جاري التحميل..."}
                  </>
                ) : (
                  confirmText || t("common.confirm") || "تأكيد"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
