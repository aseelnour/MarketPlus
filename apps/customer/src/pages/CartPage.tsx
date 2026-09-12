import { useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { generateGuestId } from "../utils/guestId";
import { useLanguage } from "../hooks/useLanguage";
import { formatNumber, formatCurrency } from "../utils/numbers";
import i18n from "../i18n";
export const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    cartItems,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentLanguage, isRTL } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    email: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    paymentMethod: "cash",
    notes: "",
  });

  const getStoreName = (item: any) => {
    
    if (
      item.productId.storeId &&
      typeof item.productId.storeId === "object" &&
      item.productId.storeId.name
    ) {
      return item.productId.storeId.name;
    }
    
    if (typeof item.productId.storeId === "string") {
      return "Store"; 
    }
    return "Store";
  };
  if (cartItems.length === 0) {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            {t("cart.shoppingCart")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(cartCount, i18n.language)} {t("cart.items")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShoppingCart size={48} className="mb-4 opacity-20" />
          <p className="font-semibold text-lg text-foreground">
            {t("cart.empty")}
          </p>
          <p className="text-sm mb-6">{t("cart.emptyDescription")}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {t("cart.browseProducts")}
          </button>
        </div>
      </div>
    );
  }
  const handlePlaceOrder = async () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.country
    ) {
      toast.error(t("cart.pleaseFill"));
      return;
    }

    setIsSubmitting(true);
    try {
      const guestId = generateGuestId();
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || "",
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((item) => {
          
          let storeId = "";

          if (
            item.productId.storeId &&
            typeof item.productId.storeId === "object"
          ) {
            const storeObj = item.productId.storeId as any;
            if (storeObj._id) {
              storeId = storeObj._id;
            }
          }
          
          else if (typeof item.productId.storeId === "string") {
            storeId = item.productId.storeId;
          }

          return {
            productId: item.productId._id,
            storeId: storeId, 
            quantity: item.quantity,
            price: item.price,
          };
        }),
        subtotal: cartTotal,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        totalPrice: cartTotal,
        notes: formData.notes,
        customerId: null,
      };

      const res = await api.post("/orders", orderData, {
        headers: { "x-guest-id": guestId },
      });

      if (res.data.success) {
        toast.success(t("cart.orderSuccess"));
        localStorage.removeItem("cart");
        clearCart();
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || t("cart.orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-foreground">
          {t("cart.shoppingCart")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(cartCount, currentLanguage)} {t("cart.items")}{" "}
        </p>
      </div>

      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.productId._id}
            className="bg-card rounded-2xl p-3.5 flex gap-3 border border-border shadow-sm"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
              <img
                src={
                  item.productId.images?.[0] || "https://via.placeholder.com/80"
                }
                alt={item.productId.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground">
                {getStoreName(item)}
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {item.productId.title}
              </p>
              <p className="text-primary font-bold text-sm mt-0.5">
                {formatCurrency(item.price, currentLanguage)}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeFromCart(item.productId._id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-2 py-1">
                <button
                  onClick={() => updateQty(item.productId._id, -1)}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-bold w-5 text-center">
                  {formatNumber(item.quantity, i18n.language)}
                </span>
                <button
                  onClick={() => updateQty(item.productId._id, 1)}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      { }
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-foreground">{t("cart.shippingInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={t("cart.fullName") + " *"}
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="email"
            placeholder={t("cart.email")}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />

          <input
            type="tel"
            placeholder={t("cart.phone") + " *"}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder={t("cart.street") + " *"}
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder={t("cart.city") + " *"}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder={t("cart.state")}
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder={t("cart.country") + " *"}
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder={t("cart.zipCode")}
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          />
          <select
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="cash">{t("cart.cash")}</option>
            <option value="credit_card">{t("cart.card")}</option>
          </select>
        </div>
        <textarea
          placeholder={t("cart.notes") + " (Optional)"}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
          rows={2}
        />
      </div>

      { }
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="font-bold text-foreground">
          {t("cart.orderSummary") || "Order Summary"}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t("cart.subtotal")}</span>
            <span className="text-foreground font-medium">
              {formatCurrency(cartTotal, currentLanguage)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t("cart.shipping")}</span>
            <span className="text-emerald-600 font-medium">
              {t("cart.free") || "Free"}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
            <span>{t("cart.total")}</span>
            <span className="text-primary">
              {formatCurrency(cartTotal, currentLanguage)}
            </span>
          </div>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("common.loading") : t("cart.placeOrder")}
        </button>
      </div>
    </div>
  );
};
