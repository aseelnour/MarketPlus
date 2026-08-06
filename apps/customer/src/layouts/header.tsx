import { useTranslation } from "react-i18next";
import { Search, Bell, Heart, ShoppingCart, User } from "lucide-react";
import LanguageSwitcher from "../components/common/language-switcher";

const Header = () => {
  const { t } = useTranslation();
  const isRTL = document.dir === "rtl";

  return (
    <header className="bg-transparent border-b border-violet-100 px-6 py-6 shadow-sm backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 order-1">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg">
              <Search size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t("app.name") || "MarketPlus"}
            </h2>
          </div>

          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isRTL ? "right-4" : "left-4"
              }`}
              size={18}
            />
            <input
              type="text"
              placeholder={
                t("search.placeholder") || "Search products, stores..."
              }
              className={`w-full rounded-full border border-violet-100 bg-white/90 py-3 pl-14 pr-5 text-base text-slate-700 shadow-sm focus:border-violet-300 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all ${
                isRTL ? "pr-14 pl-5" : "pl-14 pr-5"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 order-2">
          {isRTL ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-sm">
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=60"
                    alt={t("header.userAvatarAlt") || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button className="p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <ShoppingCart size={18} />
              </button>
              <button className="relative p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <Heart size={18} />
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-semibold">
                  2
                </span>
              </button>
              <button className="relative p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-semibold">
                  3
                </span>
              </button>
              <LanguageSwitcher />
            </>
          ) : (
            // الترتيب المثالي للإنجليزية (من اليسار لليمين): الترجمة، الجرس، القلب، السلة، الصورة
            <>
              <LanguageSwitcher />
              <button className="relative p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-semibold">
                  3
                </span>
              </button>
              <button className="relative p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <Heart size={18} />
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-semibold">
                  2
                </span>
              </button>
              <button className="p-3 rounded-2xl bg-white shadow-sm text-slate-600 hover:bg-violet-50 transition-colors">
                <ShoppingCart size={18} />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-sm">
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=60"
                    alt={t("header.userAvatarAlt") || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
