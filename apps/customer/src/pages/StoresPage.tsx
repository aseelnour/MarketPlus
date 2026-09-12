
import { useState, useEffect } from "react";
import { Store, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StoreCard } from "../components/StoreCard";
import { useFetch } from "../hooks/useFetch";
import { api, getImageUrl } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";

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
  storeCategoryIds?: string[];
}

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
}

export type FormattedStore = {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  rating: number;
  products: number;
  followers: number;
  image: string;
  cover: string;
  verified: boolean;
  followed: boolean;
};

export default function StoresPage() {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [storesList, setStoresList] = useState<StoreItem[]>([]);
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const searchQuery = useDebounce(searchInput, 500);

  const { data, loading } = useFetch<{ stores: StoreItem[] }>(
    `/customers/stores${searchQuery ? `?search=${searchQuery}` : ""}`,
  );

  useEffect(() => {
    const fetchStoreCategories = async () => {
      try {
        const res = await api.get("/customers/stores/categories");
        if (res.data.success) {
          setStoreCategories(res.data.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch store categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchStoreCategories();
  }, []);

  useEffect(() => {
    if (data?.stores) {
      setStoresList(data.stores);
    }
  }, [data]);

  const getCategoryDisplayName = (name: string, nameAr?: string) => {
    if (i18n.language === "ar" && nameAr) {
      return nameAr;
    }
    return t(`categories.${name}`, { defaultValue: name });
  };

  const filteredStores =
    selectedCategory === "all"
      ? storesList
      : storesList.filter((store) =>
          store.storeCategoryIds?.includes(selectedCategory),
        );

  const handleFollowUpdate = (
    storeId: string,
    newFollowers: number,
    _isFollowing: boolean,
  ) => {
    setStoresList((prevStores) =>
      prevStores.map((store) =>
        store._id === storeId ? { ...store, followers: newFollowers } : store,
      ),
    );
  };

  const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=120&fit=crop";
  const DEFAULT_LOGO =
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&h=80&fit=crop";

  const formattedStores = filteredStores.map((s) => ({
    id: s._id,
    name: s.name,
    nameAr: s.name,
    category: s.categories?.[0]
      ? getCategoryDisplayName(s.categories[0])
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

  const getCategoryCount = (categoryId: string) => {
    return storesList.filter((store) =>
      store.storeCategoryIds?.includes(categoryId),
    ).length;
  };

  if (loading || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      { }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            {t("stores.allStores")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredStores.length} {t("stores.storesAvailable")}
          </p>
        </div>

        { }
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder={t("stores.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      { }
      {storeCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          { }
          <button
            key="all-categories"
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
            }`}
          >
            <span className="text-base leading-none">✦</span>
            <span>{t("common.all")}</span>
            <span className="text-xs opacity-70">({storesList.length})</span>
          </button>

          { }
          {storeCategories.map((cat) => {
            const count = getCategoryCount(cat._id);
            const displayName = getCategoryDisplayName(cat.name, cat.nameAr);

            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === cat._id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
                }`}
              >
                <span className="text-base leading-none">
                  {cat.icon || cat.name.charAt(0)}
                </span>
                <span>{displayName}</span>
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      { }
      {formattedStores.length === 0 ? (
        <div className="text-center py-12">
          <Store size={48} className="mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground mt-3">
            {searchQuery ? "No stores match your search" : "No stores found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {formattedStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onFollow={handleFollowUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
