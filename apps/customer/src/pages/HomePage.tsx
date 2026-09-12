
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
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { StoreCard } from "../components/StoreCard";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useFetch } from "../hooks/useFetch";
import { getImageUrl } from "../services/api";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=120&fit=crop";
const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&h=80&fit=crop";
const DEFAULT_PRODUCT =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&400&fit=crop";

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

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const formatNumber = (num: number | string): string => {
    if (num === null || num === undefined) return "0";

    const strVal = String(num);

    if (i18n.language === "ar") {
      const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
      return strVal.replace(/[0-9]/g, (w) => arabicDigits[parseInt(w)]);
    }

    return strVal;
  };

  const { data: productsData, loading: productsLoading } = useFetch<{
    products: Product[];
  }>("/customers/stores/products?limit=100");
  const products = productsData?.products || [];

  const { data: storesData, loading: storesLoading } = useFetch<{
    stores: StoreItem[];
  }>("/customers/stores/featured?limit=4");
  const stores = storesData?.stores || [];

  const { data: statsData } = useFetch<{
    activeStores: number;
    totalProducts: number;
    avgRating: number;
  }>("/customers/stores/stats");

  const stats = {
    activeStores: statsData?.activeStores
      ? formatNumber(`${statsData.activeStores}+`)
      : formatNumber(0),
    totalProducts: statsData?.totalProducts
      ? formatNumber(`${statsData.totalProducts}+`)
      : formatNumber(0),
    avgRating: statsData?.avgRating
      ? formatNumber(`${statsData.avgRating}★`)
      : formatNumber("0★"),
  };

  const { data: categoriesData } = useFetch<{ categories: Category[] }>(
    "/customers/stores/categories",
  );
  const categories = categoriesData?.categories || [];

  const getCategoryDisplayName = (name: string, nameAr?: string) => {
    if (i18n.language === "ar" && nameAr) {
      return nameAr;
    }
    return t(`categories.${name}`, { defaultValue: name });
  };

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

  const formattedStores = stores.map((s) => ({
    id: s._id,
    name: s.name,
    nameAr: s.name,
    categories: s.categories || [],
    category:
      Array.isArray(s.categories) && s.categories.length > 0
        ? s.categories[0]
        : "General",
    rating: s.rating || 0,
    products: Array.isArray(s.products) ? s.products.length : s.products || 0,
    followers: Array.isArray(s.followers)
      ? s.followers.length
      : s.followers || 0,
    image: s.logo ? getImageUrl(s.logo) : DEFAULT_LOGO,
    cover: s.coverImage ? getImageUrl(s.coverImage) : DEFAULT_COVER,
    verified: s.isVerified || false,
    followed: false,
  }));

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

  if (productsLoading || storesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2">
      { }
      <section className="relative rounded-3xl overflow-hidden min-h-[200px] flex items-center bg-gradient-to-br from-primary via-violet-700 to-indigo-800 shadow-lg">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 p-6 max-w-xs">
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white/90 text-xs font-medium mb-3">
            <TrendingUp size={12} /> {t("home.summerId")}
          </div>
          <h2 className="text-white text-2xl font-extrabold leading-tight mb-1">
            {t("home.heroTitle")}
            <br />
            {t("home.heroSubtitle")}
          </h2>
          <p className="text-white/70 text-sm mb-4">
            {t("home.heroDescription")}
          </p>
          <button
            onClick={() => navigate("/stores")}
            className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all"
          >
            {t("home.heroButtonText")} <ArrowRight size={14} />
          </button>
        </div>

        <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden hidden sm:block">
          <img
            src={DEFAULT_COVER}
            alt="Shopping"
            className="w-full h-full object-cover object-left opacity-60"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_COVER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
        </div>
      </section>

      { }
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: t("home.activeStores"),
            value: stats.activeStores,
            icon: Store,
            color: "text-primary bg-primary/10",
          },
          {
            label: t("home.products"),
            value: stats.totalProducts,
            icon: Package,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: t("home.avgRating"),
            value: stats.avgRating,
            icon: Star,
            color: "text-amber-600 bg-amber-50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card rounded-2xl p-3.5 border border-border flex flex-col gap-2 shadow-sm"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon size={15} />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      { }
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            {t("home.featuredStores")}
          </h2>
          <button
            onClick={() => navigate("/stores")}
            className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline"
          >
            {t("home.seeAll")} <ChevronRight size={13} />
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {formattedStores.map((s) => (
            <StoreCard key={s.id} store={s} onFollow={() => {}} />
          ))}
        </div>
      </section>

      { }
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            {t("home.browseByCategory")}
          </h2>
          <Filter size={15} className="text-muted-foreground" />
        </div>
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
              ({formatNumber(formattedProducts.length)})
            </span>
          </button>

          { }
          {categories.map((cat) => {
            const count = formattedProducts.filter(
              (p) => p.category === cat._id,
            ).length;
            const displayName = getCategoryDisplayName(cat.name, cat.nameAr);

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
                <span>{displayName}</span>
                <span className="text-xs opacity-70">
                  ({formatNumber(count)})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      { }
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            {t("home.allProducts")}
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({formatNumber(formattedProducts.length)})
            </span>
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline"
          >
            {t("home.seeAll")} <ChevronRight size={13} />
          </button>
        </div>

        { }
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-border">
            <Package size={48} className="mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground mt-2">{t("home.noProducts")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([categoryName, items]) => (
              <div key={categoryName}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {categoryName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({formatNumber(items.length)})
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
          </div>
        )}
      </section>
    </div>
  );
};
