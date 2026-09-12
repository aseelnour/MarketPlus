import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";
import { generateGuestId } from "../utils/guestId";
import { Product } from "../types";
import toast from "react-hot-toast";

interface CartItem {
  productId: Product;
  quantity: number;
  price: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const guestId = generateGuestId();
  const isCleared = useRef(false);

  const updateStats = useCallback((cartItems: CartItem[]) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setCartCount(count);
    setCartTotal(total);
  }, []);

  const fetchCart = useCallback(async () => {
    if (isCleared.current) {
      isCleared.current = false;
      return;
    }

    try {
      const res = await api.get("/customers/cart", {
        headers: { "x-guest-id": guestId },
      });
      if (res.data.success) {
        const cartItems = res.data.data.cart.items || [];
        setItems(cartItems);
        updateStats(cartItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, [guestId, updateStats]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product: Product) => {
      const productId = product._id || product.id;

      if (!productId) {
        console.error("Product ID is missing!");
        return false;
      }

      const tempItems = [...items];
      const existingItem = tempItems.find(
        (item) => item.productId._id === productId,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        tempItems.push({
          productId: product,
          quantity: 1,
          price: product.price || 0,
        });
      }

      updateStats(tempItems);
      setItems(tempItems);

      try {
        const res = await api.post(
          `/customers/cart/${productId}`,
          { quantity: 1 },
          { headers: { "x-guest-id": guestId } },
        );
        if (res.data.success) {
          
          const cartItems = res.data.data.cart?.items || [];
          setItems(cartItems);
          updateStats(cartItems);
          toast.success(`${product.title || product.name} added to cart! 🛒`);
          return true;
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        
        await fetchCart();
        toast.error("Failed to add to cart");
      }
      return false;
    },
    [guestId, items, updateStats, fetchCart],
  );

  const updateQty = useCallback(
    async (productId: string, delta: number) => {
      if (!productId) {
        console.error("Product ID is missing!");
        return;
      }

      const tempItems = [...items];
      const itemIndex = tempItems.findIndex(
        (item) => item.productId._id === productId,
      );

      if (itemIndex === -1) return;

      const newQuantity = tempItems[itemIndex].quantity + delta;
      if (newQuantity <= 0) {
        tempItems.splice(itemIndex, 1);
      } else {
        tempItems[itemIndex].quantity = newQuantity;
      }

      updateStats(tempItems);
      setItems(tempItems);

      try {
        const res = await api.patch(
          `/customers/cart/${productId}`,
          { delta },
          { headers: { "x-guest-id": guestId } },
        );
        if (res.data.success) {
          const cartItems = res.data.data.cart?.items || [];
          setItems(cartItems);
          updateStats(cartItems);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        await fetchCart();
        toast.error("Failed to update quantity");
      }
    },
    [guestId, items, updateStats, fetchCart],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      
      const tempItems = items.filter(
        (item) => item.productId._id !== productId,
      );
      updateStats(tempItems);
      setItems(tempItems);

      try {
        const res = await api.delete(`/customers/cart/${productId}`, {
          headers: { "x-guest-id": guestId },
        });
        if (res.data.success) {
          const cartItems = res.data.data.cart?.items || [];
          setItems(cartItems);
          updateStats(cartItems);
          toast.success("Item removed from cart");
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        await fetchCart();
        toast.error("Failed to remove item");
      }
    },
    [guestId, items, updateStats, fetchCart],
  );

  const clearCart = useCallback(async () => {
    isCleared.current = true;
    setItems([]);
    setCartCount(0);
    setCartTotal(0);
  }, []);

  return {
    cartItems: items,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    fetchCart,
  };
};
