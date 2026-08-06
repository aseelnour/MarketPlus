import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { api } from "../../services/api";
import { useLanguage } from "../../hooks/useLanguage";

interface Product {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  store?: string | { id?: string; name?: string };
  price: number;
  discountPrice?: number;
  rating: number;
  reviews?: number;
  image?: string;
  images?: string[];
  tag?: string;
  isFeatured?: boolean;
}

interface ProductGridProps {
  selectedCategory?: string;
}

const ProductGrid = ({ selectedCategory = "All" }: ProductGridProps) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setLoading(true);
      try {
        let url = "/customers/products?limit=12";
        if (selectedCategory && selectedCategory !== "All") {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const res = await api.get(url);
        if (mounted) setProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const toggleWishlist = async (productId: string) => {
    const isWishlisted = wishlist.includes(productId);
    try {
      if (isWishlisted) {
        await api.delete(`/customers/wishlist/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        await api.post(`/customers/wishlist/${productId}`);
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  };

  // إضافة إلى السلة
  const addToCart = async (product: Product) => {
    const productId = product.id || product._id;
    let storeId =
      typeof product.store === "object" ? product.store?.id : undefined;

    if (!storeId) {
      storeId = "6a731d7365b7cc3ff2d251bf";
    }

    if (!productId) return;

    try {
      await api.post("/customers/cart", {
        productId,
        storeId: storeId,
        quantity: 1,
        price: product.discountPrice || product.price, // إرسال السعر مع الخصم إن وجد
      });
      alert(t("notifications.addedToCart") || "Product added to cart!");
    } catch (error) {
      console.error("Failed to add product to cart", error);
    }
  };

  const displayedProducts = isRTL ? [...products].reverse() : products;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 order-1">
          {t("home.allProducts") || "All Products"} ({displayedProducts.length})
        </h2>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          {t("products.loading") || "Loading products..."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {displayedProducts.map((product, index) => {
            const pId = product.id || product._id || `${index}`;
            const isWishlisted = wishlist.includes(pId);
            const pName = product.name || product.title || "";
            const pImage =
              product.image ||
              (product.images && product.images[0]) ||
              "https://via.placeholder.com/300";

            const hasDiscount =
              product.discountPrice && product.discountPrice < product.price;

            return (
              <motion.div
                key={pId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-[28px] bg-white border border-violet-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-violet-200/40 transition-all"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={pImage}
                    alt={pName}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg">
                      {product.tag}
                    </span>
                  )}
                  <button
                    onClick={() => toggleWishlist(pId)}
                    className={`absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-md transition ${
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/90 text-violet-600 hover:bg-white"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <p className="text-sm text-slate-500 mb-1">
                      {typeof product.store === "string"
                        ? product.store
                        : product.store?.name}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                      {pName}
                    </h3>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <div className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-900">
                        {product.rating}
                      </span>
                    </div>
                    <span>•</span>
                    <span>({(product.reviews ?? 0).toLocaleString()})</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-slate-400 text-sm">
                        {t("product.price") || "Price"}
                      </p>
                      <div className="flex items-center gap-2">
                        {hasDiscount ? (
                          <>
                            <p className="text-xl font-semibold text-violet-600">
                              ${product.discountPrice}
                            </p>
                            <p className="text-sm text-slate-400 line-through">
                              ${product.price}
                            </p>
                          </>
                        ) : (
                          <p className="text-xl font-semibold text-slate-900">
                            ${product.price}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 active:scale-95"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
