import { Router } from "express";
import { wishlistService } from "../../services/customer/wishlist.service";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID is required" });
    }
    const wishlist = await wishlistService.getWishlist(guestId);
    res.json({ success: true, data: { wishlist } });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch wishlist" });
  }
});

router.post("/:productId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { productId } = req.params;

    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID is required" });
    }

    const wishlist = await wishlistService.toggleProduct(guestId, productId);
    res.json({
      success: true,
      message: "Wishlist updated",
      data: { wishlist },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update wishlist",
    });
  }
});

export default router;
