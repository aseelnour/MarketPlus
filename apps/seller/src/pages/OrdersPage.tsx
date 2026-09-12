import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/apiClient";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export const OrdersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = i18n.language || "ar";

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(currentLang === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatInt = (num: number) => {
    return new Intl.NumberFormat(
      currentLang === "ar" ? "ar-EG" : "en-US",
    ).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLang === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );
  };

  const storeId =
    searchParams.get("storeId") || localStorage.getItem("lastActiveStoreId");

  const fetchOrders = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/seller/orders?storeId=${storeId}`);
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [storeId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/seller/orders/${orderId}/status`, {
        status: newStatus,
        storeId: storeId,
      });
      if (res.data.success) {
        toast.success(
          newStatus === "confirmed"
            ? t("orders.approvedSuccess") || "Order approved!"
            : t("orders.rejectedSuccess") || "Order rejected!",
        );
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(t("orders.updateError") || "Failed to update order status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={currentLang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold text-white">
          {t("orders.title") || "Orders"}
        </h1>
        <p className="text-dark-400 mt-1">
          {t("orders.subtitle") || "Manage your store orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-800/50 rounded-2xl border border-dark-700">
          <Package className="w-16 h-16 text-dark-400 mb-4 opacity-30" />
          <p className="text-dark-400 text-lg font-medium">
            {t("orders.noOrders") || "No orders found"}
          </p>
          <p className="text-dark-500 text-sm">
            {t("orders.noOrdersDesc") ||
              "Orders will appear here once customers place them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-dark-800/50 rounded-2xl p-4 border border-dark-700 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">
                    #{order.orderNumber}
                  </span>
                  <span className="text-dark-400 text-sm">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm text-white font-medium">
                    {t(`orders.status.${order.status}`) || order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-dark-700/30 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-dark-600 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.productId?.images?.[0] ||
                          "https://via.placeholder.com/48"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {t("orders.quantity") || "Qty"}:{" "}
                        {formatInt(item.quantity)}
                      </p>
                    </div>
                    <p className="text-white font-medium text-sm">
                      ${formatNumber(item.price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700">
                <div>
                  <p className="text-dark-400 text-xs">
                    {t("orders.shippingAddress") || "Shipping to"}
                  </p>
                  <p className="text-white text-sm font-medium">
                    {order.shippingAddress?.fullName},{" "}
                    {order.shippingAddress?.city}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-dark-400 text-xs">
                    {t("orders.total") || "Total"}
                  </p>
                  <p className="text-primary font-bold text-lg">
                    ${formatNumber(order.totalPrice)}
                  </p>
                </div>
              </div>

              {}
              {order.status === "pending" && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-700">
                  <button
                    onClick={() => updateOrderStatus(order._id, "confirmed")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Check size={16} />
                    {t("orders.approve") || "Approve"}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id, "cancelled")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <X size={16} />
                    {t("orders.reject") || "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
