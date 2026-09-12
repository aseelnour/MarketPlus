
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useFlyingProduct } from "../hooks/useFlyingProduct";
import { api, getImageUrl } from "../services/api";
import {
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Check,
  User,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateGuestId } from "../utils/guestId";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";
import { formatNumber, formatCurrency } from "../utils/numbers";

interface Review {
  _id: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const ProductDetailsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { flyProduct } = useFlyingProduct();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFlying, setIsFlying] = useState(false);

  const productRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [translatedDescription, setTranslatedDescription] =
    useState<string>("");

  const formatDate = (date: string) => {
    const locale = isRTL ? "ar-EG" : "en-US";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const cartIcon = document.querySelector("#cart-icon") as HTMLElement;
    if (!cartIcon || !productRef.current) {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
      return;
    }

    setIsFlying(true);

    try {
      const productImage =
        product.images?.[0] || "https://via.placeholder.com/60";

      await flyProduct(productRef.current, cartIcon, {
        productImage: productImage,
        productTitle: product.title,
      });

      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    } catch (error) {
      console.error("Flying animation error:", error);
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    } finally {
      setIsFlying(false);
    }
  };

  const [reviewForm, setReviewForm] = useState({
    guestName: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const productRes = await api.get(`/customers/stores/products/${id}`);
        if (productRes.data.success) {
          setProduct(productRes.data.data.product);
        }

        const reviewRes = await api.get(`/customers/reviews/product/${id}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.data.reviews || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(t("productDetails.notFound") || "Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, navigate, t]);

  useEffect(() => {
    const translateDescription = async () => {
      if (!product?.description) return;

      try {
        const res = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(
            product.description,
          )}`,
        );
        const data = await res.json();
        const translated = data[0].map((item: any) => item[0]).join("");
        setTranslatedDescription(translated);
      } catch (err) {
        console.error("Translation error:", err);
        setTranslatedDescription(product.description);
      }
    };

    translateDescription();
  }, [product?.description, currentLanguage]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.guestName.trim() || !reviewForm.comment.trim()) {
      toast.error(t("productDetails.fillFields") || "Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const guestId = generateGuestId();
      const res = await api.post(`/customers/reviews/product/${id}`, {
        guestId,
        guestName: reviewForm.guestName.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      if (res.data.success) {
        toast.success(
          t("productDetails.reviewSuccess") || "Review added successfully! 🎉",
        );
        setReviews((prev) => [res.data.data.review, ...prev]);
        if (product) {
          const newRating = res.data.data.review.rating;
          const totalRatings =
            reviews.reduce((sum, r) => sum + r.rating, 0) + newRating;
          const newAvg = totalRatings / (reviews.length + 1);
          setProduct((prev: any) => ({
            ...prev,
            rating: Math.round(newAvg * 10) / 10,
          }));
        }
        setReviewForm({ guestName: "", rating: 5, comment: "" });
      }
    } catch (error: any) {
      console.error("Failed to add review:", error);
      toast.error(
        error.response?.data?.message ||
          t("productDetails.reviewError") ||
          "Failed to add review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const storeName =
    typeof product.storeId === "object"
      ? product.storeId?.name || "Store"
      : "Store";
  const images = product.images || [];
  const isWishlisted = wishlist.includes(product._id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      { }
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
        <span className="text-sm font-medium">
          {t("common.back") || "Back"}
        </span>
      </button>

      { }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div ref={productRef} className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/20 shadow-sm border border-border">
            <img
              src={
                images[selectedImage]
                  ? getImageUrl(images[selectedImage])
                  : "https://via.placeholder.com/600"
              }
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/600?text=No+Image";
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/80?text=No+Image";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {storeName}
            </p>
            <h1 className="text-3xl font-extrabold text-foreground">
              {product.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center" dir="ltr">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i <= Math.round(product.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({formatNumber(reviews.length, currentLanguage)}{" "}
              {t("productDetails.reviews") || "reviews"})
            </span>
          </div>

          { }
          <div className="flex items-baseline gap-4" dir="ltr">
            <span className="text-3xl font-bold text-primary inline-block">
              {formatCurrency(product.price, currentLanguage)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-lg text-muted-foreground line-through inline-block">
                {formatCurrency(product.discountPrice, currentLanguage)}
              </span>
            )}
          </div>

          { }
          <p className="text-muted-foreground leading-relaxed">
            {translatedDescription ||
              product.description ||
              t("productDetails.noDescription") ||
              "No description available."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
            <motion.button
              whileTap={{ scale: 0.97 }}
              animate={{ scale: isAdded ? [1, 1.03, 1] : 1 }}
              transition={{ duration: 0.2 }}
              onClick={handleAddToCart}
              disabled={isFlying}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all duration-300 ${
                isAdded
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } ${isFlying ? "opacity-50 cursor-wait" : ""}`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={20} strokeWidth={2.5} />
                    <span>
                      {t("productDetails.addedToCart") || "Added to Cart!"}
                    </span>
                  </motion.div>
                ) : isFlying ? (
                  <motion.div
                    key="flying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("common.loading") || "Adding..."}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    <ShoppingCart size={20} />
                    <span>
                      {t("productDetails.addToCart") || "Add to Cart"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => toggleWishlist(product._id)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              <Heart
                size={20}
                className={
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }
              />
              <span className="font-medium text-foreground">
                {isWishlisted
                  ? t("productDetails.saved") || "Saved"
                  : t("productDetails.save") || "Save"}
              </span>
            </button>
          </div>
        </div>
      </div>

      { }
      <div className="border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t("productDetails.reviews") || "Reviews"} (
          {formatNumber(reviews.length, currentLanguage)})
        </h2>

        <div className="bg-secondary/30 rounded-2xl p-6 mb-8 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {t("productDetails.writeReview") || "Write a Review"}
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t("productDetails.yourName") || "Your name"}
                value={reviewForm.guestName}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, guestName: e.target.value })
                }
                className="w-full px-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                required
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {t("productDetails.rating") || "Rating"}:
                </span>
                <div className="flex items-center gap-1" dir="ltr">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: r })
                      }
                      className="transition-colors"
                    >
                      <Star
                        size={18}
                        className={
                          r <= reviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              placeholder={
                t("productDetails.shareExperience") ||
                "Share your experience with this product..."
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
                  {t("common.loading") || "Submitting..."}
                </>
              ) : (
                <>
                  <Send size={16} className={isRTL ? "rotate-180" : ""} />
                  {t("productDetails.submit") || "Submit Review"}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {t("productDetails.noReviews") ||
                  "No reviews yet. Be the first to review this product!"}
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
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2" dir="ltr">
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
