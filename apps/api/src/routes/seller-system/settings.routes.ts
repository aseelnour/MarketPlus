import { Router } from "express";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";
import { Seller } from "../../models/Seller.model";
import { Store } from "../../models/store.model";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/change-password", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const seller = await Seller.findById(req.seller._id).select("+password");
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

router.put("/shipping", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const { storeId, cost, freeShippingThreshold, deliveryTime } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    const store = await Store.findOne({
      _id: storeId,
      owner: req.seller._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.shippingSettings = {
      cost: cost || 0,
      freeShippingThreshold: freeShippingThreshold || 0,
      deliveryTime: deliveryTime || "3-5 days",
    };

    await store.save();

    res.json({
      success: true,
      message: "Shipping settings updated successfully",
      data: { shippingSettings: store.shippingSettings },
    });
  } catch (error) {
    console.error("❌ Update shipping settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipping settings",
    });
  }
});

router.get(
  "/shipping/:storeId",
  sellerAuthMiddleware,
  async (req: any, res) => {
    try {
      const { storeId } = req.params;

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        data: {
          shippingSettings: store.shippingSettings || {
            cost: 0,
            freeShippingThreshold: 0,
            deliveryTime: "3-5 days",
          },
        },
      });
    } catch (error) {
      console.error("❌ Get shipping settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get shipping settings",
      });
    }
  },
);

router.put("/payment", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const { storeId, methods } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    const store = await Store.findOne({
      _id: storeId,
      owner: req.seller._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.paymentMethods = methods || ["Cash on Delivery", "Credit Card"];
    await store.save();

    res.json({
      success: true,
      message: "Payment settings updated successfully",
      data: { paymentMethods: store.paymentMethods },
    });
  } catch (error) {
    console.error("❌ Update payment settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment settings",
    });
  }
});

router.get("/payment/:storeId", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findOne({
      _id: storeId,
      owner: req.seller._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: {
        paymentMethods: store.paymentMethods || [
          "Cash on Delivery",
          "Credit Card",
        ],
      },
    });
  } catch (error) {
    console.error("❌ Get payment settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment settings",
    });
  }
});

router.put("/notifications", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const { newOrders, orderUpdates, customerMessages, promotions } = req.body;

    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    seller.notificationSettings = {
      newOrders: newOrders !== undefined ? newOrders : true,
      orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
      customerMessages:
        customerMessages !== undefined ? customerMessages : true,
      promotions: promotions !== undefined ? promotions : false,
    };

    await seller.save();

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: { notificationSettings: seller.notificationSettings },
    });
  } catch (error) {
    console.error("❌ Update notification settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
    });
  }
});

router.get("/notifications", sellerAuthMiddleware, async (req: any, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.json({
      success: true,
      data: {
        notificationSettings: seller.notificationSettings || {
          newOrders: true,
          orderUpdates: true,
          customerMessages: true,
          promotions: false,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get notification settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification settings",
    });
  }
});
export default router;
