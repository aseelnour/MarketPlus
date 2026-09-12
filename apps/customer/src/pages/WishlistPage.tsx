import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductCard } from "../components/ProductCard";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../services/api";
import { generateGuestId } from "../utils/guestId";
import { useLanguage } from "../hooks/useLanguage";
import { formatNumber } from "../utils/numbers";

export const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const guestId = generateGuestId();
        const res = await api.get("/customers/wishlist", {
          headers: { "x-guest-id": guestId },
        });

        if (res.data.success) {
          const items = res.data.data.wishlist.items || [];
          setProducts(items);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            {t("wishlist.wishlist")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(0, currentLanguage)} {t("wishlist.savedItems")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Heart size={48} className="mb-4 opacity-20" />
          <p className="font-semibold text-lg text-foreground">
            {t("wishlist.noItems")}
          </p>
          <p className="text-sm mb-6">{t("wishlist.tapHeart")}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {t("wishlist.exploreProducts")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">
          {t("wishlist.wishlist")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(products.length, currentLanguage)}{" "}
          {t("wishlist.savedItems")}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product: any) => {
          
          const hasDiscount =
            product.discountPrice && product.discountPrice < product.price;

          const formattedProduct = {
            _id: product._id,
            title: product.title,
            name: product.title,
            nameAr: product.title,
            
            price: hasDiscount ? product.discountPrice : product.price,
            
            originalPrice: hasDiscount ? product.price : undefined,
            image: product.images?.[0]
              ? getImageUrl(product.images[0])
              : "https://via.placeholder.com/400",
            rating: product.rating || 0,
            reviews: 0,
            store: product.storeId?.name || "Store",
            storeId: product.storeId?._id || "",
            category: "electronics",
          };

          return (
            <ProductCard
              key={formattedProduct._id}
              product={formattedProduct}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlisted={true}
            />
          );
        })}
      </div>
    </div>
  );
};
