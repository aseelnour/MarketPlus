import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  brand?: string;
  images: string[];
  image?: string;

  rating: number;
  isActive: boolean;
  storeName?: string;
  sellerId: {
    _id: string;
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mainCategoryId: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  sellerCategoryId: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  createdAt: string;
}

interface Suggestion {
  id: string;
  text: string;
}

interface ProductResult {
  _id: string;
  title: string;
  image?: string;
  images?: [];
}

export const SearchDropdown = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setProducts([]);
      setIsOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/customers/stores/search?q=${query}`);
        if (res.data.success) {
          setSuggestions(res.data.data.suggestions || []);
          setProducts(res.data.data.products || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-12 pr-4 py-2.5 bg-secondary/60 border border-border rounded-xl outline-none focus:border-primary/50 focus:bg-card transition-all placeholder:text-muted-foreground text-sm"
        />
      </form>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || products.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50"
          >
            <div className="flex flex-col md:flex-row max-h-[400px] overflow-y-auto">
              { }
              {suggestions.length > 0 && (
                <div className="md:w-1/3 border-r border-border p-3 bg-muted/30">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    {t("common.suggestions")}
                  </p>
                  <div className="space-y-1">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setQuery(s.text);
                          setIsOpen(false);
                          navigate(`/search?q=${s.text}`);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              { }
              {products.length > 0 && (
                <div className="md:w-2/3 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    {t("common.products")}
                  </p>
                  <div className="space-y-2">
                    {products.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/product/${p._id}`);
                        }}
                        className="w-full flex items-center gap-3 px-2 py-1.5 hover:bg-primary/10 rounded-lg transition-colors text-left"
                      >
                        <img
                          src={
                            p.image ||
                            p.images?.[0] ||
                            "https://via.placeholder.com/400"
                          }
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0"
                        />
                        <span className="text-sm text-foreground line-clamp-2">
                          {p.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            { }
            <div className="border-t border-border p-3 bg-white">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="w-full flex items-center justify-between text-sm text-foreground hover:text-primary transition-colors px-2"
              >
                <span>
                  Search for "<strong>{query}</strong>"
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
