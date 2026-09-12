import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, getImageUrl } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { ArrowLeft, Filter, Store, Star, User, Send } from "lucide-react";
import { generateGuestId } from "../utils/guestId";
import toast from "react-hot-toast";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=300&fit=crop";
const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop";
const DEFAULT_PRODUCT =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop";

interface Review {
  _id: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const StoreDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    guestName: "",
    rating: 5,
    comment: "",
  });
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmitStoreReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.guestName.trim() || !reviewForm.comment.trim()) {
      toast.error(t("storeDetails.fillAllFields") || "Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const guestId = generateGuestId();
      const res = await api.post(`/customers/reviews/store/${storeId}`, {
        guestId,
        guestName: reviewForm.guestName.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      if (res.data.success) {
        toast.success(
          t("storeDetails.reviewSuccess") || "Review added successfully! 🎉",
        );
        setReviews((prev) => [res.data.data.review, ...prev]);
        if (store) {
          const newRating = res.data.data.review.rating;
          const totalRatings =
            reviews.reduce((sum, r) => sum + r.rating, 0) + newRating;
          const newAvg = totalRatings / (reviews.length + 1);
          setStore((prev: any) => ({
            ...prev,
            rating: Math.round(newAvg * 10) / 10,
          }));
        }
        setReviewForm({ guestName: "", rating: 5, comment: "" });
      }
    } catch (error: any) {
      console.error("Failed to add store review:", error);
      toast.error(
        error.response?.data?.message ||
          t("storeDetails.reviewError") ||
          "Failed to add review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        
        const storeRes = await api.get(`/customers/stores/${storeId}`);

        if (storeRes.data?.success && storeRes.data?.data?.store) {
          setStore(storeRes.data.data.store);
        } else {
          toast.error(t("storeDetails.storeNotFound") || "Store not found");
          navigate("/stores");
          return;
        }

        const productsRes = await api.get(
          `/customers/stores/${storeId}/products`,
        );

        if (productsRes.data?.success) {
          setProducts(productsRes.data.data?.products || []);
        } else {
          setProducts([]);
        }

        try {
          const reviewRes = await api.get(
            `/customers/reviews/store/${storeId}`,
          );
          if (reviewRes.data?.success) {
            setReviews(reviewRes.data.data?.reviews || []);
          }
        } catch (reviewError) {
          setReviews([]);
        }
      } catch (error: any) {
        console.error("❌ Error:", error);
        toast.error(t("storeDetails.loadError") || "Failed to load store");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId, navigate, t]);

  const uniqueCategories = products
    .map((p) => p.mainCategoryId?.name || p.mainCategoryId)
    .filter((cat): cat is string => cat && typeof cat === "string")
    .filter((value, index, self) => self.indexOf(value) === index);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => {
          const catName = p.mainCategoryId?.name || p.mainCategoryId;
          return catName === activeCategory;
        });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <Store size={48} className="mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground mt-3">
          {t("storeDetails.notFound") || "Store not found"}
        </p>
        <button
          onClick={() => navigate("/stores")}
          className="mt-4 text-primary hover:underline"
        >
          {t("storeDetails.backToStores") || "Back to Stores"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        <span className="text-sm font-medium">
          {t("common.back") || "Back"}
        </span>
      </button>

      { }
      <div className="relative rounded-3xl overflow-hidden shadow-lg">
        <div className="h-48 bg-gradient-to-br from-primary to-violet-800 w-full">
          {store.coverImage && (
            <img
              src={getImageUrl(store.coverImage)}
              alt={store.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_COVER;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
        <div className="absolute bottom-4 left-6 rtl:left-auto rtl:right-6 flex items-end gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-card shadow">
            <img
              src={store.logo ? getImageUrl(store.logo) : DEFAULT_LOGO}
              alt={store.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_LOGO;
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{store.name}</h1>
            <p className="text-white/70 text-sm">
              {store.description ||
                t("storeDetails.verifiedStore") ||
                "Verified store"}
            </p>
          </div>
        </div>
      </div>

      { }
      {uniqueCategories.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">
              {t("storeDetails.browseByCategory") || "Browse by Category"}
            </h2>
            <Filter size={15} className="text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            <button
              key="all-categories"
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <span className="text-base leading-none">✦</span>
              <span>{t("common.all") || "All"}</span>
              <span className="text-xs opacity-70">
                ({products.length.toLocaleString(i18n.language)})
              </span>
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-foreground border border-border hover:border-primary/30 hover:bg-secondary/50"
                }`}
              >
                <span className="text-base leading-none">{cat.charAt(0)}</span>
                <span>{cat}</span>
                <span className="text-xs opacity-70">
                  (
                  {products
                    .filter(
                      (p) =>
                        (p.mainCategoryId?.name || p.mainCategoryId) === cat,
                    )
                    .length.toLocaleString(i18n.language)}
                  )
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      { }
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          {t("storeDetails.allProducts") || "All Products"} (
          {filteredProducts.length.toLocaleString(i18n.language)})
        </h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Store size={48} className="mx-auto mb-2 opacity-30" />
            <p>
              {t("storeDetails.noProducts") || "No products yet in this store"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const formattedProduct = {
                _id: p._id,
                title: p.title,
                price: p.price,
                originalPrice: p.discountPrice || undefined,
                image: p.images?.[0]
                  ? getImageUrl(p.images[0])
                  : DEFAULT_PRODUCT,
                rating: p.rating || 0,
                reviews: 0,
                store: store.name,
                storeId: store._id,
                category:
                  p.mainCategoryId?.name || p.mainCategoryId || "General",
              };

              return (
                <div
                  key={formattedProduct._id}
                  onClick={() => navigate(`/product/${formattedProduct._id}`)}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={formattedProduct}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    wishlisted={wishlist.includes(formattedProduct._id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      { }
      <div className="border-t border-border pt-8 mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t("storeDetails.storeReviews") || "Store Reviews"} (
          {reviews.length.toLocaleString(i18n.language)})
        </h2>

        <div className="bg-secondary/30 rounded-2xl p-6 mb-8 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {t("storeDetails.rateThisStore") || "Rate this Store"}
          </h3>
          <form onSubmit={handleSubmitStoreReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t("storeDetails.yourName") || "Your name"}
                value={reviewForm.guestName}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, guestName: e.target.value })
                }
                className="w-full px-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                required
              />

              { }
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {t("storeDetails.rating") || "Rating"}:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: r })
                      }
                      onMouseEnter={() => setHoveredRating(r)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="transition-all p-0.5 hover:scale-110 active:scale-95"
                      aria-label={`Rate ${r} stars`}
                    >
                      <Star
                        size={22}
                        className={`transition-all duration-150 ${
                          (hoveredRating !== null && r <= hoveredRating) ||
                          (hoveredRating === null && r <= reviewForm.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1 rtl:mr-1">
                  {reviewForm.rating.toLocaleString(i18n.language)} /{" "}
                  {(5).toLocaleString(i18n.language)}
                </span>
              </div>
            </div>

            <textarea
              placeholder={
                t("storeDetails.shareExperience") ||
                "Share your experience with this store..."
              }
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              className="w-full px-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("storeDetails.submitting") || "Submitting..."}
                </>
              ) : (
                <>
                  <Send size={16} className="rtl:rotate-180" />
                  {t("storeDetails.submitReview") || "Submit Review"}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {t("storeDetails.noReviews") ||
                  "No reviews yet. Be the first to review this store!"}
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {review.guestName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString(
                      i18n.language,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Star
                      key={r}
                      size={14}
                      className={
                        r <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
