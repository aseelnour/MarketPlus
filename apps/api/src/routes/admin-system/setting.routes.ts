
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Admin } from "../../models/Admin.model";
import { Seller } from "../../models/Seller.model";
import { Store } from "../../models/store.model";
import { Product } from "../../models/Product.model";
import { Order } from "../../models/Order.model";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const [totalStores, totalProducts, totalSellers, totalOrders] =
      await Promise.all([
        Store.countDocuments({ isDeleted: false }),
        Product.countDocuments({ isDeleted: false }),
        Seller.countDocuments({ isDeleted: false }),
        Order.countDocuments(),
      ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        admin: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone || "",
          role: admin.role,
        },
        general: {
          siteName: admin.siteName || "MarketPlus",
          siteEmail: admin.siteEmail || "admin@marketplus.com",
          currency: admin.currency || "USD",
          timezone: admin.timezone || "UTC",
          maintenanceMode: admin.maintenanceMode || false,
        },
        notifications: admin.notificationSettings || {
          newOrders: true,
          newSellers: true,
          storeApprovals: true,
          dailyReports: false,
        },
        platform: {
          totalStores,
          totalProducts,
          totalSellers,
          totalOrders,
          totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
});

router.get("/profile", authMiddleware, async (req: any, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    res.json({
      success: true,
      data: { admin },
    });
  } catch (error) {
    console.error("❌ Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

router.put("/profile", authMiddleware, async (req: any, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { firstName, lastName, phone },
      { new: true },
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { admin },
    });
  } catch (error) {
    console.error("❌ Update admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

router.post("/change-password", authMiddleware, async (req: any, res) => {
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

    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

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

router.put("/general", authMiddleware, async (req: any, res) => {
  try {
    const { siteName, siteEmail, currency, timezone, maintenanceMode } =
      req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        siteName,
        siteEmail,
        currency,
        timezone,
        maintenanceMode,
      },
      { new: true },
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "General settings updated successfully",
      data: {
        general: {
          siteName: admin.siteName,
          siteEmail: admin.siteEmail,
          currency: admin.currency,
          timezone: admin.timezone,
          maintenanceMode: admin.maintenanceMode,
        },
      },
    });
  } catch (error) {
    console.error("❌ Update general settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update general settings",
    });
  }
});

router.get("/general", authMiddleware, async (req: any, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        general: {
          siteName: admin.siteName || "MarketPlus",
          siteEmail: admin.siteEmail || "admin@marketplus.com",
          currency: admin.currency || "USD",
          timezone: admin.timezone || "UTC",
          maintenanceMode: admin.maintenanceMode || false,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get general settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get general settings",
    });
  }
});

router.put("/notifications", authMiddleware, async (req: any, res) => {
  try {
    const { newOrders, newSellers, storeApprovals, dailyReports } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        notificationSettings: {
          newOrders,
          newSellers,
          storeApprovals,
          dailyReports,
        },
      },
      { new: true },
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: {
        notifications: admin.notificationSettings,
      },
    });
  } catch (error) {
    console.error("❌ Update notification settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
    });
  }
});

router.get("/notifications", authMiddleware, async (req: any, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        notifications: admin.notificationSettings || {
          newOrders: true,
          newSellers: true,
          storeApprovals: true,
          dailyReports: false,
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

router.get("/stats", authMiddleware, async (req: any, res) => {
  try {
    const [totalStores, totalProducts, totalSellers, totalOrders] =
      await Promise.all([
        Store.countDocuments({ isDeleted: false }),
        Product.countDocuments({ isDeleted: false }),
        Seller.countDocuments({ isDeleted: false }),
        Order.countDocuments(),
      ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalStores,
        totalProducts,
        totalSellers,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});

export default router;
