import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Filter,
  Package,
  TrendingUp,
  ArrowRight,
  Store,
  Star,
  Grid3x3,
  List,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useFetch } from "../hooks/useFetch";

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

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
}

export const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const { data: productsData, loading: productsLoading } = useFetch<{
    products: Product[];
  }>("/customers/stores/products?limit=100"); 

  const products = productsData?.products || [];

  const { data: categoriesData } = useFetch<{ categories: Category[] }>(
    "/customers/stores/categories",
  );
  const categories = categoriesData?.categories || [];

  const getStoreName = (product: Product): string => {
    if (typeof product.storeId === "object" && product.storeId?.name) {
      return product.storeId.name;
    }
    return "Store";
  };

  const formattedProducts = products.map((p) => {
    const hasDiscount = p.discountPrice && p.discountPrice < p.price;

    return {
      _id: p._id,
      title: p.title,
      name: p.title,
      nameAr: p.title,
      price: hasDiscount ? p.discountPrice! : p.price,
      originalPrice: hasDiscount ? p.price : undefined,
      image: p.images?.[0] || "https://via.placeholder.com/400",
      rating: p.rating || 0,
      reviews: 0,
      store: getStoreName(p),
      storeId: typeof p.storeId === "object" ? p.storeId?._id || "" : "",
      category: p.mainCategoryId?._id || "all",
      categoryName: p.mainCategoryId?.name || "Uncategorized",
    };
  });
  
  const filteredProducts =
    activeCategory === "all"
      ? formattedProducts
      : formattedProducts.filter((p) => p.category === activeCategory);

  const groupedProducts = filteredProducts.reduce(
    (acc, p) => {
      const key = p.categoryName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, typeof filteredProducts>,
  );

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2">
      { }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            {t("products.allProducts")}
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({filteredProducts.length})
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("products.browseAll")}
          </p>
        </div>

        { }
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      { }
      <div className="flex flex-wrap gap-2 pb-2">
        { }
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
          }`}
        >
          <span className="text-base leading-none">✦</span>
          <span>{t("common.all")}</span>
          <span className="text-xs opacity-70">
            ({formattedProducts.length})
          </span>
        </button>

        { }
        {categories.map((cat) => {
          const count = formattedProducts.filter(
            (p) => p.category === cat._id,
          ).length;
          return (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === cat._id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <span className="text-base leading-none">
                {cat.icon || cat.name.charAt(0)}
              </span>
              <span>{cat.name}</span>
              <span className="text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      { }

      {viewMode === "grid" ? (
        
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([categoryName, items]) => (
            <div key={categoryName}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-foreground">
                  {categoryName}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({items.length})
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={p}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      wishlisted={wishlist.includes(p._id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          { }
          {Object.keys(groupedProducts).length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground mt-3">
                {t("products.noProducts")}
              </p>
            </div>
          )}
        </div>
      ) : (
        
        <div className="space-y-4">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/product/${p._id}`)}
              className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-all"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground">{p.store}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-foreground">
                    ${p.price}
                  </span>
                  {p.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${p.originalPrice}
                    </span>
                  )}
                  <span className="text-xs text-amber-500 flex items-center gap-0.5">
                    <Star size={12} fill="currentColor" />
                    {p.rating}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(p._id);
                }}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <Star
                  size={18}
                  className={
                    wishlist.includes(p._id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }
                />
              </button>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground mt-3">
                {t("products.noProducts")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
