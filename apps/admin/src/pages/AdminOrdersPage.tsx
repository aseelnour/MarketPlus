import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  RefreshCw,
  User,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "../utils/numbers";
import { useLanguage } from "../hooks/useLanguage";

export const AdminOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { isRTL } = useLanguage();
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders");
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
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "confirmed":
        return "bg-blue-500/20 text-blue-400";
      case "shipped":
        return "bg-purple-500/20 text-purple-400";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: isRTL ? "قيد الانتظار" : "Pending",
      confirmed: isRTL ? "مؤكد" : "Confirmed",
      shipped: isRTL ? "تم الشحن" : "Shipped",
      delivered: isRTL ? "تم التوصيل" : "Delivered",
      cancelled: isRTL ? "ملغي" : "Cancelled",
    };
    return labels[status] || status;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isRTL ? "جميع الطلبات" : t("admin.orders.title") || "All Orders"}
          </h1>
          <p className="text-dark-400 mt-1">
            {isRTL
              ? "إدارة جميع طلبات السوق"
              : t("admin.orders.subtitle") || "Manage all marketplace orders"}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-white/5">
          <Package className="w-16 h-16 text-dark-400 mb-4 opacity-30" />
          <p className="text-dark-400 text-lg font-medium">
            {isRTL
              ? "لا توجد طلبات"
              : t("admin.orders.noOrders") || "No orders found"}
          </p>
          <p className="text-dark-500 text-sm">
            {isRTL
              ? "ستظهر الطلبات بعد أن يقوم العملاء بتقديمها"
              : t("admin.orders.noOrdersDesc") ||
                "Orders will appear once customers place them"}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full" dir={isRTL ? "rtl" : "ltr"}>
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "الطلب" : "Order"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "العميل" : "Customer"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "المتجر" : "Store"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "المنتجات" : "Items"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "المجموع" : "Total"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {isRTL ? "الحالة" : "Status"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}
                  >
                    {isRTL ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <p className="text-white font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-dark-400">
                        {new Date(order.createdAt).toLocaleDateString(
                          isRTL ? "ar-EG" : "en-US",
                        )}
                      </p>
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {order.customerId ? (
                        <div>
                          <p className="text-white text-sm flex items-center gap-2">
                            <User className="w-3 h-3 text-dark-400" />
                            {order.customerId.fullName ||
                              `${order.customerId.firstName} ${order.customerId.lastName}`}
                          </p>
                          <p className="text-xs text-dark-400">
                            {order.customerId.email}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-dark-400" />
                          <span className="text-dark-400 text-sm italic">
                            {isRTL ? "زائر" : "Guest"}
                          </span>
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-3 h-3 text-dark-400" />
                        <span className="text-white text-sm">
                          {order.storeId?.name ||
                            (isRTL ? "متجر غير معروف" : "Unknown Store")}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <p className="text-white text-sm">
                        {order.items?.length || 0} {isRTL ? "منتجات" : "items"}
                      </p>
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <p className="text-primary font-semibold">
                        ${order.totalPrice?.toFixed(2) || "0.00"}
                      </p>
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"}`}
                    >
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                        title={isRTL ? "عرض التفاصيل" : "View Details"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      { }
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-dark-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-dark-400">
                    {isRTL ? "العميل" : "Customer"}
                  </p>
                  <p className="text-white">
                    {selectedOrder.customerId
                      ? selectedOrder.customerId.fullName ||
                        `${selectedOrder.customerId.firstName || ""} ${selectedOrder.customerId.lastName || ""}`.trim() ||
                        (isRTL ? "زائر" : "Guest")
                      : isRTL
                        ? "زائر"
                        : "Guest"}
                  </p>
                  {selectedOrder.customerId?.phone && (
                    <p className="text-xs text-dark-400 mt-1">
                      📞 {selectedOrder.customerId.phone}
                    </p>
                  )}
                  {selectedOrder.customerId?.email && (
                    <p className="text-xs text-dark-400">
                      ✉️ {selectedOrder.customerId.email}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-dark-400">
                    {isRTL ? "المتجر" : "Store"}
                  </p>
                  <p className="text-white">
                    {selectedOrder.storeId?.name ||
                      (isRTL ? "غير معروف" : "Unknown")}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-dark-400">
                  {isRTL ? "عنوان الشحن" : "Shipping Address"}
                </p>
                <p className="text-white">
                  {selectedOrder.shippingAddress?.fullName},{" "}
                  {selectedOrder.shippingAddress?.street},{" "}
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white">
                  {isRTL ? "المنتجات" : "Items"}
                </h3>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"
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
                        {isRTL
                          ? `الكمية: ${item.quantity}`
                          : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <p className="text-white text-sm font-medium">
                      ${item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-dark-400">
                    {isRTL ? "الحالة" : "Status"}
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dark-400">
                    {isRTL ? "المجموع" : "Total"}
                  </p>
                  <p className="text-primary font-bold text-2xl">
                    ${selectedOrder.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
