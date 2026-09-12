import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { api, getImageUrl } from "../services/api";
import toast from "react-hot-toast";
import { formatNumber, formatCurrency } from "../utils/numbers";
import { useLanguage } from "../hooks/useLanguage";

interface OrderItem {
  _id: string;
  productId?: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
    discountPrice?: number;
  };
  title: string;
  quantity: number;
  price: number;
  total: number;
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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const translateTextDigits = (text: string | number) => {
    if (text === null || text === undefined) return "";
    const str = String(text);
    if (!isRTL) return str;
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/[0-9]/g, (w) => arabicDigits[parseInt(w, 10)]);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
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
    }
  }, [orderId, t]);

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
      pending: t("orders.status.pending") || "Pending",
      confirmed: t("orders.status.confirmed") || "Confirmed",
      shipped: t("orders.status.shipped") || "Shipped",
      delivered: t("orders.status.delivered") || "Delivered",
      cancelled: t("orders.status.cancelled") || "Cancelled",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date: string) => {
    const locale = isRTL ? "ar-EG" : "en-US";
    return new Date(date).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <Package size={48} className="mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground mt-3">{t("order.notFound")}</p>
        <button
          onClick={() => navigate("/profile")}
          className="mt-4 text-primary hover:underline"
        >
          {t("order.backToProfile") || "Back to Profile"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      { }
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {t("order.details") || "Order Details"}
          </h1>
          { }
          <p className="text-sm text-muted-foreground">
            #{translateTextDigits(order.orderNumber)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        { }
        <div className="lg:col-span-2 space-y-4">
          { }
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(
                  order.status,
                )}`}
              >
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          { }
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("order.items", { count: order.items.length }) ||
                `Order Items (${order.items.length})`}
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                const productImage = item.productId?.images?.[0] || null;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {productImage ? (
                        <img
                          src={getImageUrl(productImage)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/48";
                          }}
                        />
                      ) : (
                        <Package size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("order.qty") || "Qty"}:{" "}
                        {formatNumber(item.quantity, currentLanguage)} ×{" "}
                        {formatCurrency(item.price, currentLanguage)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.total, currentLanguage)}
                    </p>
                  </div>
                );
              })}
            </div>

            { }
            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("order.subtotal") || "Subtotal"}
                </span>
                <span className="text-foreground">
                  {formatCurrency(order.subtotal, currentLanguage)}
                </span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("order.shipping") || "Shipping"}
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(order.shippingCost, currentLanguage)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("order.discount") || "Discount"}
                  </span>
                  <span className="text-emerald-600">
                    -{formatCurrency(order.discount, currentLanguage)}
                  </span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("order.tax") || "Tax"}
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(order.tax, currentLanguage)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-foreground">
                  {t("order.total") || "Total"}
                </span>
                <span className="text-primary">
                  {formatCurrency(order.totalPrice, currentLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>

        { }
        <div className="space-y-4">
          { }
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <User size={16} className="text-muted-foreground" />
              {t("order.customer") || "Customer"}
            </h3>
            <p className="text-foreground font-medium">
              {order.shippingAddress.fullName}
            </p>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                { }
                <span>{translateTextDigits(order.shippingAddress.phone)}</span>
              </div>
              {order.shippingAddress.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} />
                  <span>{order.shippingAddress.email}</span>
                </div>
              )}
            </div>
          </div>

          { }
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-muted-foreground" />
              {t("order.shippingAddress") || "Shipping Address"}
            </h3>
            <p className="text-sm text-foreground">
              {order.shippingAddress.street}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              { }
              {translateTextDigits(order.shippingAddress.zipCode)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.country}
            </p>
          </div>

          { }
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-muted-foreground" />
              {t("order.payment") || "Payment"}
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("order.method") || "Method"}
                </span>
                <span className="text-foreground capitalize">
                  {order.paymentMethod === "cash"
                    ? t("order.cashOnDelivery") || "Cash on Delivery"
                    : order.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("order.paymentStatus") || "Payment Status"}
                </span>
                <span
                  className={`capitalize ${
                    order.paymentStatus === "paid"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? t("order.paid") || "Paid"
                    : t("order.pendingStatus") || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t("order.notes") || "Notes"}
              </h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
