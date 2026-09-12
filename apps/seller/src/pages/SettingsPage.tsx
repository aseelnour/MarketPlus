import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Store,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Power,
  Save,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";

interface SellerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  address: string;
}

interface StoreSettings {
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  isActive: boolean;
}

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<SellerProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    storeName: "",
    storeDescription: "",
    address: "",
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "",
    description: "",
    logo: "",
    coverImage: "",
    isActive: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [shippingSettings, setShippingSettings] = useState({
    cost: 0,
    freeShippingThreshold: 0,
    deliveryTime: "3-5 days",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        
        const profileRes = await api.get("/seller/profile");
        if (profileRes.data.success) {
          const seller = profileRes.data.data.seller;
          setProfile({
            firstName: seller.firstName || "",
            lastName: seller.lastName || "",
            email: seller.email || "",
            phone: seller.phone || "",
            storeName: seller.storeName || "",
            storeDescription: seller.storeDescription || "",
            address: seller.address || "",
          });
        }

        if (storeId) {
          const storeRes = await api.get(`/seller/stores/${storeId}`);
          if (storeRes.data.success) {
            const store = storeRes.data.data.store;
            setStoreSettings({
              name: store.name || "",
              description: store.description || "",
              logo: store.logo || "",
              coverImage: store.coverImage || "",
              isActive: store.isActive || false,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error(t("settings.toast.fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [storeId, t]);

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/seller/profile", profile);
      if (res.data.success) {
        toast.success(t("settings.toast.profileSuccess"));
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(t("settings.toast.profileError"));
    } finally {
      setSaving(false);
    }
  };

  const updateStore = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/seller/stores/${storeId}`, storeSettings);
      if (res.data.success) {
        toast.success(t("settings.toast.storeSuccess"));
      }
    } catch (error) {
      console.error("Failed to update store:", error);
      toast.error(t("settings.toast.storeError"));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("settings.toast.passwordMismatch"));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t("settings.toast.passwordMinLength"));
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/seller/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        toast.success(t("settings.toast.passwordSuccess"));
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(
        error.response?.data?.message || t("settings.toast.passwordError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStoreStatus = async () => {
    try {
      const res = await api.patch(`/seller/stores/${storeId}/status`, {
        isActive: !storeSettings.isActive,
      });
      if (res.data.success) {
        const nextState = !storeSettings.isActive;
        setStoreSettings((prev) => ({ ...prev, isActive: nextState }));
        toast.success(
          nextState
            ? t("settings.toast.storeActivated")
            : t("settings.toast.storeDeactivated"),
        );
      }
    } catch (error) {
      console.error("Failed to toggle store status:", error);
      toast.error(t("settings.toast.storeStatusError"));
    }
  };

  const tabs = [
    { id: "profile", label: t("settings.tabs.profile"), icon: User },
    { id: "store", label: t("settings.tabs.store"), icon: Store },
    { id: "shipping", label: t("settings.tabs.shipping"), icon: Truck },
    { id: "payment", label: t("settings.tabs.payment"), icon: CreditCard },
    {
      id: "notifications",
      label: t("settings.tabs.notifications"),
      icon: Bell,
    },
    { id: "security", label: t("settings.tabs.security"), icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("settings.title")}</h1>
        <p className="text-sm text-slate-400">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        { }
        <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        { }
        <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          { }
          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.profile.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.firstName")}
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.lastName")}
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.email")}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.phone")}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.storeName")}
                  </label>
                  <input
                    type="text"
                    value={profile.storeName}
                    onChange={(e) =>
                      setProfile({ ...profile, storeName: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.storeDescription")}
                  </label>
                  <textarea
                    value={profile.storeDescription}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        storeDescription: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.profile.address")}
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <button
                onClick={updateProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.common.saving")
                  : t("settings.profile.saveBtn")}
              </button>
            </div>
          )}

          { }
          {activeTab === "store" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.store.title")}
              </h2>

              { }
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div>
                  <p className="text-sm font-medium text-white">
                    {t("settings.store.statusTitle")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {storeSettings.isActive
                      ? t("settings.store.statusActiveDesc")
                      : t("settings.store.statusInactiveDesc")}
                  </p>
                </div>
                <button
                  onClick={toggleStoreStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    storeSettings.isActive
                      ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  }`}
                >
                  <Power size={14} />
                  {storeSettings.isActive
                    ? t("settings.store.deactivate")
                    : t("settings.store.activate")}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.store.name")}
                  </label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.store.description")}
                  </label>
                  <textarea
                    value={storeSettings.description}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
              </div>
              <button
                onClick={updateStore}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.common.saving")
                  : t("settings.store.saveBtn")}
              </button>
            </div>
          )}

          { }
          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.security.title")}
              </h2>
              <p className="text-sm text-slate-400">
                {t("settings.security.subtitle")}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.security.currentPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.security.newPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.security.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <button
                onClick={changePassword}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.security.changing")
                  : t("settings.security.saveBtn")}
              </button>
            </div>
          )}

          { }
          {activeTab === "shipping" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.shipping.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.shipping.cost")}
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.cost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        cost: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.shipping.freeThreshold")}
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        freeShippingThreshold: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.shipping.deliveryTime")}
                  </label>
                  <select
                    value={shippingSettings.deliveryTime}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        deliveryTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="1-2 days">
                      {t("settings.shipping.daysOptions.1_2")}
                    </option>
                    <option value="2-3 days">
                      {t("settings.shipping.daysOptions.2_3")}
                    </option>
                    <option value="3-5 days">
                      {t("settings.shipping.daysOptions.3_5")}
                    </option>
                    <option value="5-7 days">
                      {t("settings.shipping.daysOptions.5_7")}
                    </option>
                    <option value="7-14 days">
                      {t("settings.shipping.daysOptions.7_14")}
                    </option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => toast.success(t("settings.toast.shippingSaved"))}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Save size={16} />
                {t("settings.shipping.saveBtn")}
              </button>
            </div>
          )}

          { }
          {activeTab === "payment" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.payment.title")}
              </h2>
              <p className="text-sm text-slate-400">
                {t("settings.payment.subtitle")}
              </p>
              <div className="space-y-3">
                {[
                  { id: "cod", label: t("settings.payment.methods.cod") },
                  {
                    id: "credit_card",
                    label: t("settings.payment.methods.creditCard"),
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-sm text-white">{method.label}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => toast.success(t("settings.toast.paymentSaved"))}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Save size={16} />
                {t("settings.payment.saveBtn")}
              </button>
            </div>
          )}

          { }
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.notifications.title")}
              </h2>
              <p className="text-sm text-slate-400">
                {t("settings.notifications.subtitle")}
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: "new_orders",
                    label: t("settings.notifications.options.newOrders"),
                    default: true,
                  },
                  {
                    id: "order_updates",
                    label: t("settings.notifications.options.orderUpdates"),
                    default: true,
                  },
                  {
                    id: "customer_messages",
                    label: t("settings.notifications.options.customerMessages"),
                    default: true,
                  },
                  {
                    id: "promotions",
                    label: t("settings.notifications.options.promotions"),
                    default: false,
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500/30 transition-colors"
                  >
                    <span className="text-sm text-white">{item.label}</span>
                    <div className="relative w-10 h-5 bg-slate-700 rounded-full transition-colors peer-checked:bg-emerald-500">
                      <input
                        type="checkbox"
                        defaultChecked={item.default}
                        className="sr-only peer"
                      />
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5" />
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() =>
                  toast.success(t("settings.toast.notificationsSaved"))
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Save size={16} />
                {t("settings.notifications.saveBtn")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
