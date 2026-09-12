
import React from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Bell,
  Store,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { api } from "../services/api";
import { StoreSwitcher } from "../components/StoreSwitcher";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const { seller, logout } = useSellerAuth();
  const [primaryStoreName, setPrimaryStoreName] = React.useState<string | null>(
    null,
  );
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  let activeStoreId = searchParams.get("storeId");
  if (!activeStoreId || activeStoreId === "null") {
    activeStoreId = localStorage.getItem("lastActiveStoreId");
  }

  const getToken = () => {
    return localStorage.getItem("sellerToken");
  };

  const cleanInvalidStoreId = () => {
    const urlStoreId = searchParams.get("storeId");

    const invalidIds = ["6a79f765c67085e8d36becc1", "null", "", undefined];

    if (invalidIds.includes(urlStoreId as string)) {
      navigate(`/dashboard`, { replace: true });
      localStorage.removeItem("lastActiveStoreId");
      return true;
    }
    return false;
  };
  const renderNotificationMessage = (notif: any) => {
    
    if (notif.type && t(`notifications.types.${notif.type}`)) {
      return t(`notifications.types.${notif.type}`, {
        orderNumber: notif.orderNumber || notif.metadata?.orderNumber || "",
        storeName: notif.storeName || "",
        status: notif.status ? t(`order.status.${notif.status}`) : "",
        defaultValue: notif.message, 
      });
    }

    return notif.message;
  };
  const loadPrimaryStore = async () => {
    
    if (!getToken()) {
      console.warn("⚠️ No token found, skipping loadPrimaryStore");
      return;
    }

    try {
      if (!activeStoreId || activeStoreId === "null") {
        const res = await api.get("/seller/stores");
        const stores = res.data.data.stores || [];
        const activeStores = stores.filter((s: any) => s.isActive === true);

        if (activeStores.length) {
          setPrimaryStoreName(activeStores[0].name);
          localStorage.setItem("lastActiveStoreId", activeStores[0]._id);
          navigate(`/dashboard?storeId=${activeStores[0]._id}`);
        }
        return;
      }

      const res = await api.get(`/seller/stores/${activeStoreId}`);
      if (res.data.success) {
        setPrimaryStoreName(res.data.data.store.name);
      }
    } catch (err: any) {
      
      if (err.response?.status === 404) {
        console.warn(
          "⚠️ Store not found, clearing and fetching first active store",
        );
        localStorage.removeItem("lastActiveStoreId");

        try {
          const fallbackRes = await api.get("/seller/stores");
          const stores = fallbackRes.data.data.stores || [];
          const activeStores = stores.filter((s: any) => s.isActive === true);

          if (activeStores.length) {
            setPrimaryStoreName(activeStores[0].name);
            localStorage.setItem("lastActiveStoreId", activeStores[0]._id);
            navigate(`/dashboard?storeId=${activeStores[0]._id}`);
          }
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
        }
      } else {
        console.error("Error loading store:", err);
      }
    }
  };

  const fetchNotifications = async () => {
    
    if (!getToken() || !activeStoreId || activeStoreId === "null") return;

    try {
      const res = await api.get(
        `/seller/notifications?storeId=${activeStoreId}`,
      );
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadMessages = async () => {
    
    if (!getToken() || !activeStoreId || activeStoreId === "null") return;

    try {
      const res = await api.get(
        `/seller/messages/seller/conversations?storeId=${activeStoreId}`,
      );
      if (res.data.success) {
        const conversations = res.data.data.conversations || [];
        const totalUnread = conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unreadSeller || 0),
          0,
        );
        setUnreadMessages(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch unread messages:", error);
    }
  };

  React.useEffect(() => {
    
    const wasCleaned = cleanInvalidStoreId();

    if (!getToken()) {
      console.warn("⚠️ No token found, skipping all API calls");
      return;
    }

    if (wasCleaned) {
      return;
    }

    loadPrimaryStore();
    fetchNotifications();
    fetchUnreadMessages();

    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [activeStoreId]);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "order_updated":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "order_cancelled":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    toast.success(t("auth.login.success") || "Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard") || "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Package,
      label: t("sidebar.products") || "Products",
      path: "/products",
    },
    {
      icon: ShoppingCart,
      label: t("sidebar.orders") || "Orders",
      path: "/orders",
    },
    { icon: Store, label: t("sidebar.stores") || "Stores", path: "/stores" },
    {
      icon: Users,
      label: t("sidebar.customers") || "Customers",
      path: "/customers",
    },
    {
      icon: BarChart3,
      label: t("sidebar.analytics") || "Analytics",
      path: "/analytics",
    },
    {
      icon: MessageCircle,
      label: t("sidebar.messages") || "Messages",

      path: "/messages",
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      icon: Settings,
      label: t("sidebar.settings") || "Settings",
      path: "/settings",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex"
      dir={isRTL ? "rtl" : "ltr"}
    >
      { }
      <aside
        className={`fixed top-0 bottom-0 z-40 w-64 bg-slate-900/80 backdrop-blur-xl border-slate-800 flex flex-col transition-all duration-300 ${
          isRTL ? "right-0 border-l" : "left-0 border-r"
        }`}
      >
        { }
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/60">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {t("app.name") || "MarketPlus"}
          </span>
        </div>

        { }
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const fullPath = `${item.path}?storeId=${activeStoreId || ""}`;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={fullPath}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`}
                />
                <span className="flex-1">{item.label}</span>

                { }
                {item.badge && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        { }
        <div className="p-3 border-t border-slate-800/80 space-y-3 bg-slate-900/40">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1.5">
              Active Store
            </p>
            <StoreSwitcher />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 text-xs font-semibold">
                {seller?.firstName?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {seller?.firstName} {seller?.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      seller?.status === "active"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="text-[11px] text-slate-400 capitalize truncate">
                    {seller?.status || "Seller"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title={t("sidebar.logout") || "Logout"}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      { }
      <div
        className={`flex-1 flex flex-col min-w-0 ${isRTL ? "mr-64" : "ml-64"}`}
      >
        { }
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-white">
              {t("dashboard.welcome") || "Welcome back"}
            </h1>
            <p className="text-xs text-slate-400">
              {t("dashboard.subtitle") || "Manage your store and products"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            { }
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                     
                    className={`absolute mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 overflow-hidden ${
                      isRTL ? "left-0" : "right-0"
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                      { }
                      <span className="text-xs font-semibold text-slate-300">
                        {t("notifications.title") || "Notifications"}
                      </span>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {t("notifications.clearAll") || "Clear all"}
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <p className="text-slate-500 text-xs py-6 text-center">
                          {t("notifications.empty") || "No notifications"}
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`flex items-start gap-3 p-2.5 transition-colors ${
                              notif.isRead ? "opacity-60" : "bg-slate-800/30"
                            }`}
                          >
                            <div className="mt-0.5">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-emerald-400">
                                {notif.storeName || "Store"}
                              </p>
                              <p className="text-xs text-slate-200 line-clamp-2">
                                {renderNotificationMessage(notif)}{" "}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString(
                                  isRTL ? "ar-EG" : "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        { }
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
