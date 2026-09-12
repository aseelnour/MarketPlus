import { useState, useRef } from "react";
import { Heart, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Stars } from "./Stars";
import { Badge } from "./Badge";
import { Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyingProduct } from "../hooks/useFlyingProduct";
import { formatNumber, formatCurrency } from "../utils/numbers";
import { useLanguage } from "../hooks/useLanguage";

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  wishlisted,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlisted: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const { flyProduct } = useFlyingProduct();
  const [added, setAdded] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product._id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const cartIcon = document.querySelector("#cart-icon") as HTMLElement;
    if (!cartIcon) {
      
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
      return;
    }

    const productElement = cardRef.current;
    if (!productElement) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
      return;
    }

    setIsFlying(true);

    try {
      
      const productImage =
        product.image ||
        product.images?.[0] ||
        "https://via.placeholder.com/60";

      await flyProduct(productElement, cartIcon, {
        productImage: productImage,
        productTitle: product.title,
      });

      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (error) {
      console.error("Flying animation error:", error);
      
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } finally {
      setIsFlying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-border flex flex-col cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-square bg-secondary/30">
        <img
          src={
            product.image ||
            product.images?.[0] ||
            "https://via.placeholder.com/400"
          }
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-2.5 left-2.5">
            <Badge label={product.badge} />
          </div>
        )}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-200 ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 text-muted-foreground hover:text-red-500"
          }`}
        >
          <Heart size={14} className={wishlisted ? "fill-white" : ""} />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {product.store ||
              (typeof product.storeId === "object"
                ? product.storeId?.name
                : t("common.store"))}
          </p>
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {product.title}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-muted-foreground">
            ({formatNumber(product.reviews || 0, currentLanguage)})
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-base font-bold text-primary">
              {formatCurrency(product.price, currentLanguage)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through ml-1">
                {formatCurrency(product.originalPrice, currentLanguage)}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            animate={{ scale: added ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.2 }}
            onClick={handleAddToCart}
            disabled={isFlying}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
              added
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } ${isFlying ? "opacity-50 cursor-wait" : ""}`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Check size={16} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Plus size={15} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
