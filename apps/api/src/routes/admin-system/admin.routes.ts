import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Seller } from "../../models/Seller.model";
import { Category } from "../../models/Category.model";
import { Product } from "../../models/Product.model";
import { Order } from "../../models/Order.model";

const router = Router();

router.get("/dashboard", authMiddleware, async (req: any, res: Response) => {
  try {
    const totalSellers = await Seller.countDocuments();
    const pendingSellers = await Seller.countDocuments({ status: "pending" });
    const activeSellers = await Seller.countDocuments({ status: "active" });
    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topCategories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    const totalProductsCount = await Product.countDocuments({ isActive: true });
    const topCategoriesWithPercentage = topCategories.map((item: any) => ({
      name: item._id,
      count: item.count,
      percentage:
        totalProductsCount > 0
          ? Math.round((item.count / totalProductsCount) * 100)
          : 0,
    }));

    const recentActivities: any[] = [];

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("orderNumber totalPrice status createdAt");

    recentOrders.forEach((order: any) => {
      recentActivities.push({
        id: `order-${order._id}`,
        type: "new_order",
        message: `New order #${order.orderNumber} placed - $${order.totalPrice}`,
        time: timeAgo(order.createdAt),
      });
    });

    const recentSellers = await Seller.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("storeName firstName lastName createdAt status");

    recentSellers.forEach((seller: any) => {
      recentActivities.push({
        id: `seller-${seller._id}`,
        type: "new_seller",
        message: `New seller registered: ${seller.storeName}`,
        time: timeAgo(seller.createdAt),
      });
    });

    recentActivities.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    const dashboardData = {
      success: true,
      data: {
        stats: {
          totalSellers: totalSellers || 0,
          pendingSellers: pendingSellers || 0,
          activeSellers: activeSellers || 0,
          totalCategories: totalCategories || 0,
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          revenue: totalRevenue || 0,
        },
        charts: {
          revenueData: revenueData.map((item: any) => ({
            month: getMonthName(item._id),
            revenue: item.total,
          })),
          topCategories: topCategoriesWithPercentage,
          recentActivities: recentActivities.slice(0, 5),
        },
        admin: {
          name: `${req.admin.firstName} ${req.admin.lastName}`,
          email: req.admin.email,
          role: req.admin.role,
        },
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard data" });
  }
});

router.get("/sellers", authMiddleware, async (req: any, res: Response) => {
  try {
    const { status, search } = req.query;

    console.log("📊 Fetching sellers with filters:", { status, search });

    let filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const sellers = await Seller.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${sellers.length} sellers`);

    const total = await Seller.countDocuments(filter);
    const pending = await Seller.countDocuments({ status: "pending" });
    const active = await Seller.countDocuments({ status: "active" });
    const rejected = await Seller.countDocuments({ status: "rejected" });
    const suspended = await Seller.countDocuments({ status: "suspended" });

    res.json({
      success: true,
      data: {
        sellers,
        stats: {
          total,
          pending,
          active,
          rejected,
          suspended,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get sellers error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch sellers" });
  }
});

router.patch(
  "/sellers/:id/status",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "active", "suspended", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const seller = await Seller.findByIdAndUpdate(
        id,
        { status, isApproved: status === "active" },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: `Seller status updated to ${status}`,
        data: { seller },
      });
    } catch (error) {
      console.error("❌ Update seller status error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update seller status" });
    }
  },
);

router.put(
  "/sellers/:id/approve",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        { status: "active", isApproved: true },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: "Seller approved successfully",
        data: { seller },
      });
    } catch (error) {
      console.error("❌ Approve seller error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to approve seller" });
    }
  },
);

router.put(
  "/sellers/:id/reject",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        { status: "rejected", isApproved: false },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: "Seller rejected successfully",
        data: { seller },
      });
    } catch (error) {
      console.error("❌ Reject seller error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to reject seller" });
    }
  },
);

router.put(
  "/sellers/:id/suspend",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        { status: "suspended", isApproved: false },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: "Seller suspended successfully",
        data: { seller },
      });
    } catch (error) {
      console.error("❌ Suspend seller error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to suspend seller" });
    }
  },
);

router.put(
  "/sellers/:id/activate",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        { status: "active", isApproved: true },
        { new: true },
      ).select("-password");

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: "Seller activated successfully",
        data: { seller },
      });
    } catch (error) {
      console.error("❌ Activate seller error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to activate seller" });
    }
  },
);

router.delete(
  "/sellers/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      );

      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      res.json({
        success: true,
        message: "Seller soft-deleted successfully",
        data: seller,
      });
    } catch (error) {
      console.error("❌ Delete seller error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete seller" });
    }
  },
);

router.get("/products", authMiddleware, async (req: any, res: Response) => {
  try {
    const { search, sellerId, categoryId, status } = req.query;

    let filter: any = { isDeleted: false };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    if (categoryId) {
      filter.mainCategoryId = categoryId;
    }

    // ✅ هذا يفلتر حسب الحالة إذا تم اختيار فلتر معين
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }
    // ✅ إذا كان status = "all" أو undefined، يجيب كل المنتجات (نشطة وغير نشطة)

    const products = await Product.find(filter)
      .populate("sellerId", "storeName firstName lastName email")
      .populate("mainCategoryId", "name nameAr")
      .populate("sellerCategoryId", "name nameAr")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

router.patch(
  "/products/:id/status",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const product = await Product.findByIdAndUpdate(
        id,
        { isActive },
        { new: true },
      );

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({
        success: true,
        message: "Product status updated",
        data: { product },
      });
    } catch (error) {
      console.error("Update product status error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update product status" });
    }
  },
);

router.delete(
  "/products/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete product" });
    }
  },
);

router.get("/categories", authMiddleware, async (req: any, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});

router.post("/categories", authMiddleware, async (req: any, res: Response) => {
  try {
    const { name, nameAr, icon, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = new Category({
      name,
      nameAr,
      icon,
      description,
      isActive: true,
    });

    await category.save();

    res.json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
});

router.put(
  "/categories/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameAr, icon, description, isActive } = req.body;

      const category = await Category.findByIdAndUpdate(
        id,
        { name, nameAr, icon, description, isActive },
        { new: true },
      );

      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      res.json({
        success: true,
        message: "Category updated successfully",
        data: { category },
      });
    } catch (error) {
      console.error("Update category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update category" });
    }
  },
);

router.delete(
  "/categories/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      );

      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete category" });
    }
  },
);

function getMonthName(monthNumber: number): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthNumber - 1] || "Jan";
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 604800)} weeks ago`;
}

export default router;
