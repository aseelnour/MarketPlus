import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Search,
  Mail,
  Phone,
  Package,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";

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

export const CustomersPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storeId = searchParams.get("storeId");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      currentLang === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get(`/seller/orders?storeId=${storeId}`);
        if (res.data.success) {
          const orders = res.data.data.orders || [];
          const customerMap = new Map<string, Customer>();

          orders.forEach((order: any) => {
            const phone = order.shippingAddress?.phone;
            if (!phone) return;

            if (customerMap.has(phone)) {
              const existing = customerMap.get(phone)!;
              existing.orderCount += 1;
              existing.totalSpent += order.totalPrice || 0;
              if (new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
                existing.lastOrderAt = order.createdAt;
              }
            } else {
              customerMap.set(phone, {
                _id: phone,
                fullName:
                  order.shippingAddress?.fullName ||
                  t("customers.unknown") ||
                  "Unknown",
                phone: phone,
                email: order.shippingAddress?.email || "",
                orderCount: 1,
                totalSpent: order.totalPrice || 0,
                lastOrderAt: order.createdAt,
                createdAt: order.createdAt,
              });
            }
          });

          setCustomers(Array.from(customerMap.values()));
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast.error(t("customers.loadError") || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchCustomers();
    }
  }, [storeId, t]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5" dir={currentLang === "ar" ? "rtl" : "ltr"}>
      { }
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("customers.title") || "Customers"}
          </h1>
          <p className="text-sm text-dark-400">
            {t("customers.subtitle", { count: customers.length }) ||
              `${customers.length} customers who purchased from your store`}
          </p>
        </div>

        { }
        <div className="relative">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 text-dark-400 ${
              currentLang === "ar" ? "right-3" : "left-3"
            }`}
            size={16}
          />
          <input
            type="text"
            placeholder={
              t("customers.searchPlaceholder") || "Search customers..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-primary/50 w-full sm:w-64 ${
              currentLang === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"
            }`}
          />
        </div>
      </div>

      { }
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5">
          <User size={48} className="mx-auto text-dark-400/40" />
          <p className="text-dark-400 mt-3">
            {searchQuery
              ? t("customers.noMatch") || "No customers match your search"
              : t("customers.noCustomers") || "No customers yet"}
          </p>
        </div>
      ) : (
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-start">
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-start">
                    {t("customers.columns.customer") || "Customer"}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-start hidden sm:table-cell">
                    {t("customers.columns.contact") || "Contact"}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-start hidden md:table-cell">
                    {t("customers.columns.orders") || "Orders"}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-start hidden lg:table-cell">
                    {t("customers.columns.totalSpent") || "Total Spent"}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-start hidden xl:table-cell">
                    {t("customers.columns.firstOrder") || "First Order"}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-dark-400 text-end">
                    {t("customers.columns.action") || "Action"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {customer.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-start">
                      <div className="space-y-1">
                        { }
                        <div className="flex items-center gap-1.5 text-xs text-dark-400">
                          <Phone size={12} className="shrink-0" />
                          <span>
                            {currentLang === "ar"
                              ? customer.phone.replace(
                                  /\d/g,
                                  (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)],
                                )
                              : customer.phone}
                          </span>
                        </div>

                        { }
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-dark-400">
                            <Mail size={12} className="shrink-0" />
                            <span dir="ltr" className="truncate">
                              {customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-dark-400" />
                        <span className="text-sm text-white">
                          {formatInt(customer.orderCount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-white font-medium">
                        ${formatNumber(customer.totalSpent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-dark-400">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => {
                          navigate(
                            `/orders?storeId=${storeId}&phone=${customer.phone}`,
                          );
                        }}
                        className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                      >
                        <span>
                          {t("customers.viewOrders") || "View Orders"}
                        </span>
                        <ChevronLeft size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
