import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { generateGuestId } from "../utils/guestId";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const guestId = generateGuestId();

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.get("/customers/wishlist", {
        headers: { "x-guest-id": guestId },
      });
      if (res.data.success) {
        const items = res.data.data.wishlist.items || [];
        setWishlist(items.map((p: any) => p._id));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist");
    }
  }, [guestId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      try {
        const res = await api.post(
          `/customers/wishlist/${productId}`,
          {},
          { headers: { "x-guest-id": guestId } },
        );
        if (res.data.success) {
          const items = res.data.data.wishlist.items || [];
          setWishlist(items.map((p: any) => p._id));
        }
      } catch (error) {
        console.error("Failed to toggle wishlist");
      }
    },
    [guestId],
  );

  return { wishlist, toggleWishlist, fetchWishlist };
};
