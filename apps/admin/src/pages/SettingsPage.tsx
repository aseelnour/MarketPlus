
import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Bell,
  Globe,
  Database,
  Mail,
  Save,
  Key,
  Users,
  Store,
  Package,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  const [profile, setProfile] = useState<AdminProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "MarketPlus",
    siteEmail: "admin@marketplus.com",
    currency: "USD",
    timezone: "UTC",
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    newSellers: true,
    storeApprovals: true,
    dailyReports: false,
  });

  const [platformStats, setPlatformStats] = useState({
    totalStores: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const profileRes = await api.get("/admin/settings/profile");
        if (profileRes.data.success) {
          const admin = profileRes.data.data.admin;
          setProfile({
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            email: admin.email || "",
            phone: admin.phone || "",
          });
        }

        const generalRes = await api.get("/admin/settings/general");
        if (generalRes.data.success) {
          const general = generalRes.data.data.general;
          setGeneralSettings({
            siteName: general.siteName || "MarketPlus",
            siteEmail: general.siteEmail || "admin@marketplus.com",
            currency: general.currency || "USD",
            timezone: general.timezone || "UTC",
            maintenanceMode: general.maintenanceMode || false,
          });
        }

        const notifRes = await api.get("/admin/settings/notifications");
        if (notifRes.data.success) {
          const notifications = notifRes.data.data.notifications;
          setNotificationSettings({
            newOrders:
              notifications.newOrders !== undefined
                ? notifications.newOrders
                : true,
            newSellers:
              notifications.newSellers !== undefined
                ? notifications.newSellers
                : true,
            storeApprovals:
              notifications.storeApprovals !== undefined
                ? notifications.storeApprovals
                : true,
            dailyReports: notifications.dailyReports || false,
          });
        }

        const statsRes = await api.get("/admin/settings/stats");
        if (statsRes.data.success) {
          setPlatformStats(statsRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/admin/settings/profile", profile);
      if (res.data.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/admin/settings/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      
      if (error.response?.status !== 400) {
        console.error("Failed to change password:", error);
      }
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };
  const updateGeneralSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put("/admin/settings/general", generalSettings);
      if (res.data.success) {
        toast.success("General settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to update general settings:", error);
      toast.error("Failed to update general settings");
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put(
        "/admin/settings/notifications",
        notificationSettings,
      );
      if (res.data.success) {
        toast.success("Notification settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "platform", label: "Platform", icon: Database },
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
              {t(`settings.tabs.${tab.id}`)}
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
              <p className="text-sm text-slate-400">
                {t("settings.profile.subtitle")}
              </p>
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
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
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
              </div>
              <button
                onClick={updateProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.common.saving")
                  : t("settings.profile.save")}
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
                <Key size={16} />
                {saving
                  ? t("settings.security.changing")
                  : t("settings.security.changePassword")}
              </button>
            </div>
          )}

          { }
          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.general.title")}
              </h2>
              <p className="text-sm text-slate-400">
                {t("settings.general.subtitle")}
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.general.siteName")}
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t("settings.general.siteEmail")}
                  </label>
                  <input
                    type="email"
                    value={generalSettings.siteEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {t("settings.general.currency")}
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JOD">JOD (JD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {t("settings.general.timezone")}
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST</option>
                      <option value="Europe/London">GMT</option>
                      <option value="Asia/Amman">Amman</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t("settings.general.maintenanceMode")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {generalSettings.maintenanceMode
                        ? t("settings.general.maintenanceOn")
                        : t("settings.general.maintenanceOff")}
                    </p>
                  </div>
                  <div className="relative w-10 h-5 bg-slate-700 rounded-full transition-colors peer-checked:bg-emerald-500">
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          maintenanceMode: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5" />
                  </div>
                </div>
              </div>
              <button
                onClick={updateGeneralSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.common.saving")
                  : t("settings.general.save")}
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
                    id: "newOrders",
                    labelKey: "settings.notifications.items.newOrders",
                  },
                  {
                    id: "newSellers",
                    labelKey: "settings.notifications.items.newSellers",
                  },
                  {
                    id: "storeApprovals",
                    labelKey: "settings.notifications.items.storeApprovals",
                  },
                  {
                    id: "dailyReports",
                    labelKey: "settings.notifications.items.dailyReports",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500/30 transition-colors"
                  >
                    <span className="text-sm text-white">
                      {t(item.labelKey)}
                    </span>
                    <div className="relative w-10 h-5 bg-slate-700 rounded-full transition-colors peer-checked:bg-emerald-500">
                      <input
                        type="checkbox"
                        checked={
                          notificationSettings[
                            item.id as keyof typeof notificationSettings
                          ]
                        }
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.id]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5" />
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={updateNotificationSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? t("settings.common.saving")
                  : t("settings.notifications.save")}
              </button>
            </div>
          )}

          { }
          {activeTab === "platform" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {t("settings.platform.title")}
              </h2>
              <p className="text-sm text-slate-400">
                {t("settings.platform.subtitle")}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <Store size={18} className="text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {platformStats.totalStores}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.totalStores")}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <Package size={18} className="text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {platformStats.totalProducts}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.totalProducts")}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <Users size={18} className="text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {platformStats.totalSellers}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.totalSellers")}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <ShoppingCart size={18} className="text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {platformStats.totalOrders}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.totalOrders")}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 col-span-2">
                  <TrendingUp size={18} className="text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    ${platformStats.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.totalRevenue")}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="text-amber-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    {t("settings.platform.systemInfo")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("settings.platform.version", {
                      version: import.meta?.env?.VITE_APP_VERSION || "1.0.0",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
