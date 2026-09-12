import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Heart, User, Home, Store } from "lucide-react";
import { SearchDropdown } from "../components/SearchDropdown";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

export const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, cartItems, addToCart, fetchCart } = useCart();
  const { wishlist, fetchWishlist } = useWishlist();

  const [isBouncing, setIsBouncing] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const toArabicDigits = (num: number | string) => {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
  };

  const formatBadgeCount = (count: number) => {
    const isArabic = i18n.language.startsWith("ar");
    if (count > 99) {
      return isArabic ? "+٩٩" : "99+";
    }
    return isArabic ? toArabicDigits(count) : count.toString();
  };

  useEffect(() => {
    if (cartCount > prevCount) {
      setIsBouncing(true);
      const timer = setTimeout(() => {
        setIsBouncing(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const isActive = (path: string) => location.pathname === path;
  const wishlistCount = wishlist?.length || 0;

  const sidebarLinks = [
    { path: "/", icon: Home, label: t("common.home") },
    { path: "/stores", icon: Store, label: t("stores.allStores") },
    { path: "/cart", icon: ShoppingCart, label: t("cart.shoppingCart") },
    { path: "/wishlist", icon: Heart, label: t("wishlist.wishlist") },
    { path: "/profile", icon: User, label: t("profile.myProfile") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow">
              <Store size={16} className="text-primary-foreground" />
            </div>
            <span className="font-extrabold text-foreground text-base tracking-tight hidden sm:block">
              Market<span className="text-primary">Plus</span>
            </span>
          </div>

          <SearchDropdown />

          <div className="flex items-center gap-1 ml-auto">
            <LanguageSwitcher />

            { }
            <button
              onClick={() => navigate("/wishlist")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary/60"
            >
              <Heart size={18} className="text-foreground/70" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {formatBadgeCount(wishlistCount)}
                </span>
              )}
            </button>

            { }
            <div
              id="cart-icon"
              ref={cartIconRef}
              onClick={() => navigate("/cart")}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary/60 cursor-pointer transition-all ${
                isBouncing ? "animate-bounce-custom" : ""
              }`}
            >
              <ShoppingCart size={18} className="text-foreground/70" />

              {cartCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center transition-all ${
                    isBouncing ? "animate-bounce-count" : ""
                  }`}
                >
                  {formatBadgeCount(cartCount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5 flex gap-8">
        <aside className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0 pt-2">
          {sidebarLinks.map(({ path, icon: Icon, label }) => {
            const isCart = path === "/cart";
            const isWishlist = path === "/wishlist";

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  isActive(path)
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-foreground/70 hover:text-foreground hover:bg-black/5"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive(path) ? "" : "text-foreground/70"}
                />
                {label}

                {isCart && cartCount > 0 && (
                  <span
                    className={`absolute ltr:right-3 rtl:left-3 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center transition-all ${
                      isBouncing ? "animate-bounce-count" : ""
                    }`}
                  >
                    {formatBadgeCount(cartCount)}
                  </span>
                )}

                {isWishlist && wishlistCount > 0 && (
                  <span className="absolute ltr:right-3 rtl:left-3 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {formatBadgeCount(wishlistCount)}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      { }
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {sidebarLinks.map(({ path, icon: Icon, label }) => {
            const isCart = path === "/cart";
            const isWishlist = path === "/wishlist";

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 transition-all relative ${
                  isActive(path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-8 rounded-xl transition-colors ${
                    isActive(path) ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon size={18} />

                  {isCart && cartCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center transition-all ${
                        isBouncing ? "animate-bounce-count" : ""
                      }`}
                    >
                      {formatBadgeCount(cartCount)}
                    </span>
                  )}

                  {isWishlist && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {formatBadgeCount(wishlistCount)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
