import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { ArrowLeft } from "lucide-react";

export const SearchResultsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  interface Product {
    _id: string;
    title: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    rating: number;
    storeId?: { name: string; _id: string; logo?: string };
    mainCategoryId?: { _id: string; name: string; nameAr?: string };
  }
  interface StoreItem {
    _id: string;
    name: string;
    logo?: string;
    coverImage?: string;
    rating: number;
    products?: any[] | number;
    followers?: any[] | number;
    isVerified?: boolean;
    categories?: string[];
  }
  interface Category {
    _id: string;
    name: string;
    nameAr?: string;
    icon?: string;
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.get(
          `/customers/stores/search?q=${encodeURIComponent(query)}`,
        );
        if (res.data.success) {
          setProducts(res.data.data.products || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const getStoreName = (product: Product): string => {
    if (typeof product.storeId === "object" && product.storeId?.name) {
      return product.storeId.name;
    }
    return "Store";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">{t("common.back")}</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          {t("common.search")} "{<span className="text-primary">{query}</span>}"
        </h1>
        <p className="text-sm text-muted-foreground">
          {products.length} {t("products.products")}{" "}
          {t("common.noData").toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((p) => {
          const formatted = {
            _id: p._id,
            title: p.title,
            nameAr: p.title,
            price: p.price,
            originalPrice: p.discountPrice || undefined,
            image: p.images?.[0] || "https://via.placeholder.com/400",
            rating: p.rating || 0,
            reviews: 0,
            store: getStoreName(p),
            storeId: typeof p.storeId === "object" ? p.storeId?._id || "" : "",
            category: "general",
          };
          return (
            <div
              key={formatted._id}
              onClick={() => navigate(`/product/${formatted._id}`)}
              className="cursor-pointer"
            >
              <ProductCard
                product={formatted}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                wishlisted={wishlist.includes(formatted._id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
