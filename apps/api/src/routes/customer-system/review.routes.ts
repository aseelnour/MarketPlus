import { Router } from "express";
import { reviewService } from "../../services/customer/review.service";

const router = Router();

router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(productId);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
});

router.post("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { guestId, guestName, rating, comment } = req.body;

    if (!guestId || !guestName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Guest ID, name, rating, and comment are required",
      });
    }

    const review = await reviewService.addProductReview(
      productId,
      guestId,
      guestName,
      rating,
      comment,
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { review },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add review",
    });
  }
});

router.get("/store/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const reviews = await reviewService.getReviewsByStore(storeId);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
});

router.post("/store/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { guestId, guestName, rating, comment } = req.body;

    if (!guestId || !guestName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Guest ID, name, rating, and comment are required",
      });
    }

    const review = await reviewService.addStoreReview(
      storeId,
      guestId,
      guestName,
      rating,
      comment,
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { review },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add review",
    });
  }
});

export default router;
