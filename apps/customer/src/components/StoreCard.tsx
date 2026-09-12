import { CheckCircle } from "lucide-react";
import { Stars } from "./Stars";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { generateGuestId } from "../utils/guestId";
import { FormattedStore } from "../pages/StoresPage";
import toast from "react-hot-toast";
import { formatNumber } from "../utils/numbers";
import { useLanguage } from "../hooks/useLanguage";

interface StoreCardProps {
  store: FormattedStore;
  onFollow?: (
    storeId: string,
    newFollowers: number,
    isFollowing: boolean,
  ) => void;
  hideFollowButton?: boolean;
}

export function StoreCard({
  store,
  onFollow,
  hideFollowButton = false,
}: StoreCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(store.followed);
  const [isLoading, setIsLoading] = useState(false);
  const guestId = generateGuestId();

  useEffect(() => {
    if (hideFollowButton) return;

    const checkFollow = async () => {
      try {
        const res = await api.get("/customers/follow", {
          headers: { "x-guest-id": guestId },
        });
        if (res.data.success) {
          const followData = res.data.data.follow;
          const followedIds =
            followData?.storeIds?.map((s: any) =>
              typeof s === "string"
                ? s
                : s?._id?.toString() || s?.toString() || "",
            ) || [];
          setIsFollowing(followedIds.includes(store.id));
        }
      } catch (error) {
        console.error("Failed to check follow status", error);
      }
    };
    checkFollow();
  }, [store.id, guestId, hideFollowButton]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.post(
        `/customers/follow/${store.id}`,
        {},
        { headers: { "x-guest-id": guestId } },
      );

      if (res.data.success) {
        const newState = !isFollowing;
        setIsFollowing(newState);

        const updatedFollowers = newState
          ? store.followers + 1
          : store.followers - 1;

        if (onFollow) {
          onFollow(store.id, updatedFollowers, newState);
        }

        toast.success(
          newState
            ? t("stores.following", { name: store.name })
            : t("stores.unfollowed", { name: store.name }),
        );
      }
    } catch (error: any) {
      console.error("Failed to toggle follow", error);
      toast.error(
        error.response?.data?.message || "Failed to update follow status",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formattedFollowers = () => {
    if (store.followers >= 1000) {
      const kValue = (store.followers / 1000).toFixed(1);
      return `${formatNumber(kValue, currentLanguage)}K`;
    }
    return formatNumber(store.followers || 0, currentLanguage);
  };

  return (
    <div
      onClick={() => navigate(`/store/${store.id}`)}
      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border min-w-[220px] flex-shrink-0 hover:shadow-md transition-shadow cursor-pointer group"
    >
      { }
      <div className="relative h-20 bg-secondary/40">
        <img
          src={store.cover || "https://via.placeholder.com/400x80"}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

        { }
        <div className="absolute -bottom-5 left-3.5 rtl:left-auto rtl:right-3.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-card shadow bg-card">
            <img
              src={store.image || "https://via.placeholder.com/80"}
              alt={store.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/80";
              }}
            />
          </div>
        </div>
      </div>

      { }
      <div className="pt-7 px-3.5 pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-foreground truncate">
                {store.name}
              </span>
              {store.verified && (
                <CheckCircle
                  size={13}
                  className="text-primary fill-primary/10 flex-shrink-0"
                />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Stars rating={store.rating} />
              <span className="text-[11px] text-muted-foreground">
                {formatNumber(
                  store.rating?.toFixed(1) || "0.0",
                  currentLanguage,
                )}
              </span>
            </div>
          </div>

          { }
          {!hideFollowButton && (
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading
                ? "..."
                : isFollowing
                  ? t("vendor.following") || "Following"
                  : t("vendor.follow") || "Follow"}
            </button>
          )}
        </div>

        { }
        <div className="flex gap-3 mt-2.5 text-[11px] text-muted-foreground">
          <span>
            {t("vendor.products", {
              count: store.products || 0,
              formattedCount: formatNumber(
                store.products || 0,
                currentLanguage,
              ),
            }) ||
              `${formatNumber(store.products || 0, currentLanguage)} products`}
          </span>
          <span>·</span>
          <span>
            {t("vendor.followers", {
              count: store.followers || 0,
              formattedCount: formattedFollowers(),
            }) || `${formattedFollowers()} followers`}
          </span>
        </div>
      </div>
    </div>
  );
}
