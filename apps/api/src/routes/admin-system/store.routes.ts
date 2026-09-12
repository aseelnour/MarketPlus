import { authMiddleware } from "../../middlewares/auth.middleware";
import { Store } from "../../models/store.model";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/pending", authMiddleware, async (req: Request, res: Response) => {
  try {
    const stores = await Store.find({
      isActive: false,
      isDeleted: false,
    })
      .populate("owner", "firstName lastName email storeName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error("Get pending stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending stores",
    });
  }
});

router.put(
  "/:id/approve",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { isActive: true, isVerified: true },
        { new: true },
      );

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        message: "Store approved successfully",
        data: { store },
      });
    } catch (error) {
      console.error("Approve store error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve store",
      });
    }
  },
);

router.put(
  "/:id/reject",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true, isActive: false },
        { new: true },
      );

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        message: "Store rejected and deleted",
        data: { store },
      });
    } catch (error) {
      console.error("Reject store error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject store",
      });
    }
  },
);

router.get("/all", authMiddleware, async (req: Request, res: Response) => {
  try {
    const stores = await Store.find({ isDeleted: false })
      .populate("owner", "firstName lastName email storeName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all stores",
    });
  }
});

router.get("/stores", authMiddleware, async (req: any, res: Response) => {
  try {
    const { search, featured } = req.query;

    let filter: any = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    const stores = await Store.find(filter)
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error("❌ Get stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
    });
  }
});

router.patch(
  "/stores/:id/featured",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const store = await Store.findByIdAndUpdate(
        id,
        { isFeatured },
        { new: true },
      );

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        message: `Store ${isFeatured ? "featured" : "unfeatured"} successfully`,
        data: { store },
      });
    } catch (error) {
      console.error("❌ Toggle featured error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle featured status",
      });
    }
  },
);
export default router;
