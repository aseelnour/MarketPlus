import { Router } from "express";
import { cartService } from "../../services/customer/cart.service";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    if (!guestId)
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });
    const cart = await cartService.getCart(guestId);
    res.json({ success: true, data: { cart } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
});

router.post("/:productId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    if (!guestId)
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });

    const cart = await cartService.addToCart(guestId, productId, quantity);
    res.json({ success: true, message: "Item added to cart", data: { cart } });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to add to cart",
      });
  }
});

router.patch("/:productId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { productId } = req.params;
    const { delta } = req.body;

    if (!guestId)
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });

    const cart = await cartService.updateQuantity(guestId, productId, delta);
    res.json({ success: true, message: "Quantity updated", data: { cart } });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to update quantity",
      });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { productId } = req.params;

    if (!guestId)
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });

    const cart = await cartService.removeFromCart(guestId, productId);
    res.json({
      success: true,
      message: "Item removed from cart",
      data: { cart },
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to remove from cart",
      });
  }
});

export default router;
