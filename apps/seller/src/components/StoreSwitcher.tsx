import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronUp, Building2, Check } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface StoreOption {
  _id: string;
  name: string;
  logo?: string;
  isActive?: boolean;
}

export const StoreSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [currentStore, setCurrentStore] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get("/seller/stores");
        const storesData = res.data.data.stores || [];
        const activeStores = storesData.filter(
          (store: any) => store.isActive === true,
        );

        setStores(activeStores);

        const urlStoreId = searchParams.get("storeId");
        const storedStoreId = localStorage.getItem("lastActiveStoreId");

        let activeId = urlStoreId || storedStoreId;

        if (activeId) {
          const storeExists = activeStores.some((s: any) => s._id === activeId);
          if (!storeExists) {
            activeId = activeStores[0]?._id;
          }
        } else {
          activeId = activeStores[0]?._id;
        }

        if (activeId) {
          setCurrentStore(activeId);
          localStorage.setItem("lastActiveStoreId", activeId);
          if (urlStoreId !== activeId) {
            navigate(`/dashboard?storeId=${activeId}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };
    fetchStores();
  }, [searchParams]);

  const handleSwitchStore = (storeId: string) => {
    if (storeId === currentStore) {
      setIsOpen(false);
      return;
    }
    setCurrentStore(storeId);
    localStorage.setItem("lastActiveStoreId", storeId);
    setIsOpen(false);
    navigate(`/dashboard?storeId=${storeId}`);
  };

  const currentStoreName =
    stores.find((s) => s._id === currentStore)?.name || "Select Store";

  return (
    <div className="relative w-full" ref={menuRef}>
      { }
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 text-slate-200 text-xs font-medium transition-all duration-150"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{currentStoreName}</span>
        </div>
        <ChevronUp
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      { }
      <AnimatePresence>
        {isOpen && stores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto"
          >
            <div className="px-3 py-1.5 border-b border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Switch Store
              </span>
            </div>

            <div className="p-1 space-y-0.5">
              {stores.map((store) => {
                const isSelected = store._id === currentStore;
                return (
                  <button
                    key={store._id}
                    onClick={() => handleSwitchStore(store._id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-400 font-medium"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="truncate">{store.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
