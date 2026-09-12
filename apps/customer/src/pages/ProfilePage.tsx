
import {
  User,
  MapPin,
  ShoppingCart,
  Bell,
  Package,
  ChevronRight,
  Store,
  Phone,
  Mail,
  LogOut,
  Heart,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../services/api";
import { generateGuestId } from "../utils/guestId";
import toast from "react-hot-toast";
import { StoreCard } from "../components/StoreCard";
import { useLanguage } from "../hooks/useLanguage";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=120&fit=crop";
const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&h=80&fit=crop";

interface OrderItem {
  _id: string;
  title: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    email?: string;
  };
}

interface StoreItem {
  _id: string;
  name: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  products?: number;
  followers?: number;
  isVerified?: boolean;
}

interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  createdAt: string;
}

export const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [followedStores, setFollowedStores] = useState<StoreItem[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [conversations, setConversations] = useState<Record<string, string>>(
    {},
  );

  const translateTextDigits = (text: string | number) => {
    if (text === null || text === undefined) return "";
    const str = String(text);
    if (!isRTL) return str;
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/[0-9]/g, (w) => arabicDigits[parseInt(w, 10)]);
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat(isRTL ? "ar-EG" : "en-US").format(num);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(isRTL ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(isRTL ? "ar-EG" : "en-US");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const guestId = generateGuestId();
        const res = await api.get("/customers/profile", {
          headers: { "x-guest-id": guestId },
        });

        if (res.data.success) {
          const data = res.data.data;
          if (data.customer) setCustomer(data.customer);
          if (data.orders) setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        toast.error(t("profile.fetchError") || "Failed to load profile data");
      } finally {
        setLoadingCustomer(false);
        setLoadingOrders(false);
      }
    };

    fetchCustomerData();
  }, [t]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const guestId = generateGuestId();
        const res = await api.get("/messages/customer/conversations", {
          headers: { "x-guest-id": guestId },
        });

        if (res.data.success) {
          const convMap: Record<string, string> = {};
          res.data.data.conversations.forEach((conv: any) => {
            convMap[conv.orderId] = conv._id;
          });
          setConversations(convMap);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchFollowedStores = async () => {
      try {
        const guestId = generateGuestId();
        const res = await api.get("/customers/follow", {
          headers: { "x-guest-id": guestId },
        });

        if (res.data.success) {
          const followData = res.data.data.follow;
          let storeIds = followData?.storeIds || [];

          if (!Array.isArray(storeIds)) storeIds = [];

          if (storeIds.length === 0) {
            setFollowedStores([]);
            setLoadingFollowed(false);
            return;
          }

          const storesPromises = storeIds.map(async (storeId: any) => {
            const id =
              typeof storeId === "string"
                ? storeId
                : storeId?._id?.toString() || storeId?.toString() || "";

            if (!id || id === "[object Object]") return null;

            try {
              const response = await api.get(`/customers/stores/${id}`);
              return response.data.success ? response.data.data.store : null;
            } catch (error: any) {
              return null;
            }
          });

          const storesResults = await Promise.all(storesPromises);
          setFollowedStores(storesResults.filter(Boolean));
        }
      } catch (error) {
        console.error("Failed to fetch followed stores:", error);
      } finally {
        setLoadingFollowed(false);
      }
    };

    fetchFollowedStores();
  }, []);

  const goToConversation = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages/${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-600 bg-amber-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "shipped":
        return "text-purple-600 bg-purple-50";
      case "delivered":
        return "text-emerald-600 bg-emerald-50";
      case "cancelled":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formattedFollowedStores = followedStores.map((s) => ({
    id: s._id,
    name: s.name,
    nameAr: s.name,
    category: t("common.general") || "General",
    rating: s.rating || 0,
    products: s.products || 0,
    followers: s.followers || 0,
    image: s.logo ? getImageUrl(s.logo) : DEFAULT_LOGO,
    cover: s.coverImage ? getImageUrl(s.coverImage) : DEFAULT_COVER,
    verified: s.isVerified || false,
    followed: true,
  }));

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      { }
      <div className="bg-gradient-to-br from-primary to-violet-800 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow bg-white/20 flex items-center justify-center">
            {customer?.fullName ? (
              <span className="text-3xl font-bold">
                {customer.fullName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={32} className="text-white/60" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-lg">
              {customer?.fullName || t("profile.guestUser") || "Guest User"}
            </h2>
            {!customer && (
              <p className="text-white/60 text-xs mt-1">
                {t("profile.noOrdersYet") ||
                  "No orders placed yet. Start shopping!"}
              </p>
            )}
            {customer?.phone && (
              <p className="text-white/70 text-sm flex items-center gap-2">
                <Phone size={12} />
                { }
                <span className="truncate">
                  {translateTextDigits(customer.phone)}
                </span>
              </p>
            )}
            {customer?.email && (
              <p className="text-white/60 text-xs flex items-center gap-2">
                <Mail size={12} />
                <span className="truncate">{customer.email}</span>
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Clock size={12} className="text-white/60" />
              <span className="text-white/60 text-xs">
                {t("profile.memberSince") || "Member since"}{" "}
                {customer?.createdAt ? formatDate(customer.createdAt) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 bg-white/10 rounded-2xl p-3">
          <div className="text-center">
            <p className="font-bold text-lg">{formatNumber(orders.length)}</p>
            <p className="text-white/60 text-xs">
              {t("profile.orders") || "Orders"}
            </p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="font-bold text-lg">
              {formatNumber(followedStores.length)}
            </p>
            <p className="text-white/60 text-xs">
              {t("profile.following") || "Following"}
            </p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">
              {formatCurrency(customer?.totalSpent || 0)}
            </p>
            <p className="text-white/60 text-xs">
              {t("profile.totalSpent") || "Total Spent"}
            </p>
          </div>
        </div>
      </div>

      { }
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">
            {t("profile.recentOrders") || "Recent Orders"}
          </h3>
          {orders.length > 5 && (
            <button
              onClick={() => navigate("/orders")}
              className="text-primary text-xs font-semibold hover:underline"
            >
              {t("common.viewAll") || "View All"} {isRTL ? "←" : "→"}
            </button>
          )}
        </div>
        {loadingOrders ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>{t("orders.empty") || "No orders yet"}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-3 text-primary text-sm font-semibold hover:underline"
            >
              {t("orders.startShopping") || "Start Shopping"}{" "}
              {isRTL ? "←" : "→"}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col gap-2 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      { }
                      <span className="font-semibold text-sm text-foreground">
                        {translateTextDigits(order.orderNumber)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {t(`orders.status.${order.status}`) || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>·</span>
                      <span>
                        {formatNumber(order.items.length)}{" "}
                        {t("orders.itemsCount") || "items"}
                      </span>
                      <span>·</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border/50">
                  <button
                    onClick={(e) => goToConversation(order._id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <MessageCircle size={14} />
                    {t("orders.messageSeller") || "Message Seller"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/order/${order._id}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 text-foreground hover:bg-secondary/70 transition-all"
                  >
                    {t("orders.viewOrder") || "View Order"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      { }
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">
            {t("profile.followedStores") || "Stores I Follow"}
          </h3>
          {followedStores.length > 4 && (
            <button
              onClick={() => navigate("/stores")}
              className="text-primary text-xs font-semibold hover:underline"
            >
              {t("common.viewAll") || "View All"} {isRTL ? "←" : "→"}
            </button>
          )}
        </div>
        {loadingFollowed ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : formattedFollowedStores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart size={40} className="mx-auto mb-2 opacity-30" />
            <p>
              {t("stores.noFollowed") || "You are not following any stores yet"}
            </p>
            <button
              onClick={() => navigate("/stores")}
              className="mt-3 text-primary text-sm font-semibold hover:underline"
            >
              {t("stores.discover") || "Discover Stores"} {isRTL ? "←" : "→"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formattedFollowedStores.slice(0, 4).map((store) => (
              <StoreCard key={store.id} store={store} hideFollowButton={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
