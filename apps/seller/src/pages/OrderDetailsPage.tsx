import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";
import { formatNumber, formatPhoneNumber } from "../utils/numbers";

interface OrderItem {
  _id: string;
  title: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  items: OrderItem[];
  notes?: string;
}

export const OrderDetailsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let activeStoreId = storeId;
        if (!activeStoreId) {
          activeStoreId = localStorage.getItem("lastActiveStoreId") || "";
        }

        const res = await api.get(`/seller/orders/${orderId}`, {
          params: { storeId: activeStoreId },
        });

        if (res.data.success) {
          setOrder(res.data.data.order);
        }
      } catch (error: any) {
        console.error("Failed to fetch order:", error);
        if (error.response?.status === 404) {
          toast.error(t("order.notFound") || "Order not found");
        } else {
          toast.error(t("order.loadError") || "Failed to load order details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
      toast.error(t("order.noId") || "No order ID provided");
    }
  }, [orderId, storeId, t]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(
        `/seller/orders/${orderId}/status`,
        { status: newStatus },
        { params: { storeId } },
      );
      if (res.data.success) {
        setOrder(res.data.data.order);
        toast.success(
          t("order.statusUpdated", { status: newStatus }) ||
            `Order status updated to ${newStatus}`,
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(t("order.updateError") || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "confirmed":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "delivered":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t("order.status.pending") || "Pending",
      confirmed: t("order.status.confirmed") || "Confirmed",
      shipped: t("order.status.shipped") || "Shipped",
      delivered: t("order.status.delivered") || "Delivered",
      cancelled: t("order.status.cancelled") || "Cancelled",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(
      currentLanguage === "ar" ? "ar-EG" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-dark-400/40" />
        <p className="text-dark-400 mt-3">{t("order.notFound")}</p>
        <button
          onClick={() => navigate(`/orders?storeId=${storeId || ""}`)}
          className="mt-4 text-primary hover:underline"
        >
          {t("order.backToOrders") || "Back to Orders"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      { }
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/orders?storeId=${storeId || ""}`)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("order.details") || "Order Details"}
            </h1>
            <p className="text-sm text-dark-400">#{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        { }
        <div className="lg:col-span-2 space-y-4">
          { }
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </span>
                <span className="text-xs text-dark-400">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="px-3 py-1.5 bg-dark-800/80 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 disabled:opacity-50 [&>option]:bg-dark-800 [&>option]:text-white"
                >
                  <option value="pending" className="bg-dark-800 text-white">
                    {t("order.status.pending") || "Pending"}
                  </option>
                  <option value="confirmed" className="bg-dark-800 text-white">
                    {t("order.status.confirmed") || "Confirmed"}
                  </option>
                  <option value="shipped" className="bg-dark-800 text-white">
                    {t("order.status.shipped") || "Shipped"}
                  </option>
                  <option value="delivered" className="bg-dark-800 text-white">
                    {t("order.status.delivered") || "Delivered"}
                  </option>
                  <option value="cancelled" className="bg-dark-800 text-white">
                    {t("order.status.cancelled") || "Cancelled"}
                  </option>
                </select>
                <button
                  onClick={() => navigate(`/messages?storeId=${storeId || ""}`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
                >
                  <MessageCircle size={16} />
                  {t("order.message") || "Message"}
                </button>
              </div>
            </div>
          </div>

          { }
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <ShoppingBag size={16} className="text-dark-400" />
              {t("order.items", { count: order.items.length }) ||
                `Order Items (${order.items.length})`}
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any) => {
                const productImage = item.productId?.images?.[0] || null;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-dark-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-dark-400">
                        {t("order.qty") || "Qty"}:{" "}
                        {formatNumber(item.quantity, currentLanguage)} ×{" "}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      ${formatNumber(item.total, currentLanguage)}
                    </p>
                  </div>
                );
              })}
            </div>

            { }
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">
                  {t("order.subtotal") || "Subtotal"}
                </span>
                <span className="text-white">
                  ${formatNumber(order.subtotal, currentLanguage)}
                </span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">
                    {t("order.shipping") || "Shipping"}
                  </span>
                  <span className="text-white">
                    ${formatNumber(order.shippingCost, currentLanguage)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">
                    {t("order.discount") || "Discount"}
                  </span>
                  <span className="text-emerald-400">
                    -${formatNumber(order.discount, currentLanguage)}
                  </span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">
                    {t("order.tax") || "Tax"}
                  </span>
                  <span className="text-white">
                    ${formatNumber(order.tax, currentLanguage)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                <span className="text-white">
                  {t("order.total") || "Total"}
                </span>
                <span className="text-primary">
                  ${formatNumber(order.totalPrice, currentLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>

        { }
        <div className="space-y-4">
          { }
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <User size={16} className="text-dark-400" />
              {t("order.customer") || "Customer"}
            </h3>
            <p className="text-white font-medium">
              {order.shippingAddress.fullName}
            </p>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-dark-400">
                <Phone size={14} />
                <span dir="ltr" className="inline-block">
                  {formatPhoneNumber(
                    order.shippingAddress.phone,
                    currentLanguage,
                  )}
                </span>
              </div>
              {order.shippingAddress.email && (
                <div className="flex items-center gap-2 text-dark-400">
                  <Mail size={14} />
                  <span>{order.shippingAddress.email}</span>
                </div>
              )}
            </div>
          </div>

          { }
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-dark-400" />
              {t("order.shippingAddress") || "Shipping Address"}
            </h3>
            <p className="text-sm text-white">{order.shippingAddress.street}</p>
            <p className="text-sm text-dark-400">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm text-dark-400">
              {order.shippingAddress.country}
            </p>
          </div>

          { }
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-dark-400" />
              {t("order.payment") || "Payment"}
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">
                  {t("order.method") || "Method"}
                </span>
                <span className="text-white capitalize">
                  {order.paymentMethod === "cash"
                    ? t("order.cashOnDelivery") || "Cash on Delivery"
                    : order.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">
                  {t("order.paymentStatus") || "Payment Status"}
                </span>
                <span
                  className={`capitalize ${
                    order.paymentStatus === "paid"
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? t("order.paid") || "Paid"
                    : t("order.pending") || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                {t("order.notes") || "Notes"}
              </h3>
              <p className="text-sm text-dark-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
