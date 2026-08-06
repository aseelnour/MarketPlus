import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const { t } = useTranslation();
  const isRTL = document.dir === "rtl";

  const menuItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: t("nav.home") },
    { to: "/stores", icon: <Store size={20} />, label: t("nav.stores") },
    { to: "/cart", icon: <ShoppingCart size={20} />, label: t("nav.cart") },
    { to: "/wishlist", icon: <Heart size={20} />, label: t("nav.wishlist") },
    { to: "/profile", icon: <User size={20} />, label: t("nav.profile") },
  ];

  return (
    <aside
      className={`fixed top-0 h-screen w-64 bg-white shadow-lg border-r border-violet-100 flex flex-col z-50 ${
        isRTL ? "right-0 border-r-0 border-l" : "left-0"
      }`}
    >
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">MarketPlus</h1>
            <p className="text-sm text-slate-500">
              {t("common.customerDashboard")}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-violet-100 space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-all duration-200">
          <Settings size={20} />
          <span>{t("nav.settings")}</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200">
          <LogOut size={20} />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
