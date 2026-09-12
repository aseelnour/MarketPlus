import { Router, Request, Response } from "express";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";
import { Seller } from "../../models/Seller.model";
import { Category } from "../../models/Category.model";
import { SellerCategory } from "../../models/seller-category.model";
import { Product } from "../../models/Product.model";
import { Order } from "../../models/Order.model";
import { Store } from "../../models/store.model";
import { Notification } from "../../models/Notification.model";
const router = Router();

router.get(
  "/profile",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findById(req.seller._id).select("-password");
      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }
      res.json({ success: true, data: { seller } });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch profile" });
    }
  },
);

router.put(
  "/profile",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        phone,
        storeName,
        storeDescription,
        address,
        socialMedia,
      } = req.body;

      const seller = await Seller.findByIdAndUpdate(
        req.seller._id,
        {
          firstName,
          lastName,
          phone,
          storeName,
          storeDescription,
          address,
          socialMedia,
        },
        { new: true },
      ).select("-password");

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { seller },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update profile" });
    }
  },
);

router.get("/categories/main", async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get main categories error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});

router.get(
  "/categories/seller",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId } = req.query;

      if (!storeId || storeId === "null") {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
        });
      }

      const sellerCategories = await SellerCategory.find({
        sellerId: req.seller._id,
        storeId: storeId,
        isActive: true,
        isDeleted: false,
      })
        .populate("mainCategoryId", "name nameAr")
        .sort({ name: 1 });

      res.json({
        success: true,
        data: { sellerCategories },
      });
    } catch (error) {
      console.error("❌ Get seller categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seller categories",
      });
    }
  },
);

router.get(
  "/categories/seller/:mainCategoryId",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { mainCategoryId } = req.params;
      const { storeId } = req.query;

      if (!storeId || storeId === "null") {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
        });
      }

      const sellerCategories = await SellerCategory.find({
        sellerId: req.seller._id,
        storeId: storeId,
        mainCategoryId,
        isActive: true,
        isDeleted: false,
      }).sort({ name: 1 });

      res.json({
        success: true,
        data: { sellerCategories },
      });
    } catch (error) {
      console.error("❌ Get seller categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seller categories",
      });
    }
  },
);

router.post(
  "/categories/seller",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId, mainCategoryId, name, nameAr, description } = req.body;

      if (!storeId || !mainCategoryId || !name) {
        return res.status(400).json({
          success: false,
          message: "storeId, main category ID and name are required",
        });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
      });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const mainCategory = await Category.findOne({
        _id: mainCategoryId,
        type: "store",
        isActive: true,
        isDeleted: false,
      });
      if (!mainCategory) {
        return res.status(404).json({
          success: false,
          message: "Store category not found",
        });
      }

      const storeCategoryIds = store.storeCategoryIds || [];
      if (!storeCategoryIds.includes(mainCategoryId)) {
        return res.status(403).json({
          success: false,
          message: `You are not authorized to add categories under "${mainCategory.name}". This store does not have this category.`,
        });
      }

      const existing = await SellerCategory.findOne({
        sellerId: req.seller._id,
        storeId: storeId,
        mainCategoryId,
        name: { $regex: new RegExp(`^${name}$`, "i") },
        isDeleted: false,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a category with this name under this store category",
        });
      }

      const sellerCategory = new SellerCategory({
        sellerId: req.seller._id,
        storeId: storeId,
        mainCategoryId,
        name,
        nameAr,
        description,
        isActive: true,
        isDeleted: false,
      });

      await sellerCategory.save();

      res.json({
        success: true,
        message: "Seller category created successfully",
        data: { sellerCategory },
      });
    } catch (error) {
      console.error("❌ Create seller category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create seller category",
      });
    }
  },
);

router.put(
  "/categories/seller/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameAr, description, isActive } = req.body;

      const sellerCategory = await SellerCategory.findOne({
        _id: id,
        sellerId: req.seller._id,
      });

      if (!sellerCategory) {
        return res.status(404).json({
          success: false,
          message: "Seller category not found",
        });
      }

      if (name) sellerCategory.name = name;
      if (nameAr) sellerCategory.nameAr = nameAr;
      if (description) sellerCategory.description = description;
      if (isActive !== undefined) sellerCategory.isActive = isActive;

      await sellerCategory.save();

      res.json({
        success: true,
        message: "Seller category updated successfully",
        data: { sellerCategory },
      });
    } catch (error) {
      console.error("Update seller category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update seller category" });
    }
  },
);

router.delete(
  "/categories/seller/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const sellerCategory = await SellerCategory.findOneAndUpdate(
        {
          _id: id,
          sellerId: req.seller._id,
          isDeleted: { $ne: true },
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        },
        { new: true },
      );

      if (!sellerCategory) {
        return res.status(404).json({
          success: false,
          message: "Seller category not found",
        });
      }

      await Product.updateMany(
        { sellerCategoryId: id },
        { $unset: { sellerCategoryId: "" } },
      );

      res.json({
        success: true,
        message: "Seller category soft-deleted successfully",
      });
    } catch (error) {
      console.error("Delete seller category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete seller category" });
    }
  },
);

router.post(
  "/products",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const {
        storeId,
        storeCategoryId,
        sellerCategoryId,
        title,
        description,
        price,
        discountPrice,
        quantity,
        brand,
        images,
      } = req.body;

      let store;
      if (storeId) {
        store = await Store.findOne({ _id: storeId, owner: req.seller._id });
      } else {
        store = await Store.findOne({ owner: req.seller._id, isActive: true });
      }

      if (!store) {
        return res.status(400).json({
          success: false,
          message: "You don't have an active store to add products to.",
        });
      }

      if (!storeCategoryId) {
        return res.status(400).json({
          success: false,
          message: "Store category is required",
        });
      }

      const storeCategory = await Category.findOne({
        _id: storeCategoryId,
        type: "store",
        isActive: true,
      });

      if (!storeCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid store category",
        });
      }

      if (!sellerCategoryId) {
        return res.status(400).json({
          success: false,
          message: "Seller category is required",
        });
      }

      const sellerCategory = await SellerCategory.findOne({
        _id: sellerCategoryId,
        sellerId: req.seller._id,
        storeId: store._id,
        mainCategoryId: storeCategoryId,
      });

      if (!sellerCategory) {
        return res.status(404).json({
          success: false,
          message: "Seller category not found or does not belong to this store",
        });
      }

      const product = new Product({
        sellerId: req.seller._id,
        storeId: store._id,
        mainCategoryId: storeCategoryId,
        sellerCategoryId: sellerCategoryId,
        title,
        description,
        price,
        discountPrice,
        quantity,
        brand,
        images: images || ["placeholder.jpg"],
        isActive: true,
      });

      await product.save();

      store.products.push(product._id);
      await store.save();

      sellerCategory.products.push(product._id);
      await sellerCategory.save();

      res.json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error: any) {
      console.error("❌ Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message || "Something went wrong",
      });
    }
  },
);

router.get(
  "/products",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId } = req.query;

      let filter: any = {
        sellerId: req.seller._id,
        isDeleted: false,
      };

      if (storeId) {
        filter.storeId = storeId;
      }

      const products = await Product.find(filter)
        .populate("mainCategoryId", "name nameAr")
        .populate("sellerCategoryId", "name nameAr")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  },
);

router.get("/orders", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const { storeId } = req.query;

    if (!storeId || storeId === "null") {
      return res.status(400).json({
        success: false,
        message: "Store ID is required to fetch orders",
      });
    }

    const store = await Store.findOne({
      _id: storeId,
      owner: req.seller._id,
      isDeleted: { $ne: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or not owned by you",
      });
    }

    const orders = await Order.find({ storeId: storeId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "title price images");

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

router.get(
  "/dashboard",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      let { storeId } = req.query;

      if (!storeId || storeId === "null") {
        const firstStore = await Store.findOne({
          owner: req.seller._id,
          isActive: true,
          isDeleted: { $ne: true },
        }).sort({ createdAt: -1 });

        if (firstStore) {
          storeId = firstStore._id.toString();
        } else {
          return res.status(404).json({
            success: false,
            message:
              "No active store found for this seller. Please create or activate a store.",
          });
        }
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
        isDeleted: { $ne: true },
      });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const totalProducts = await Product.countDocuments({
        storeId: store._id,
        isActive: true,
      });

      const totalSellerCategories = await SellerCategory.countDocuments({
        sellerId: req.seller._id,
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          stats: {
            totalProducts: totalProducts || 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalSales: 0,
            rating: store.rating || 0,
            followers: store.followers?.length || 0,
            totalSellerCategories: totalSellerCategories || 0,
          },
          recentOrders: [],
          topProducts: [],
          store,
        },
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch dashboard data" });
    }
  },
);

router.delete(
  "/products/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { storeId } = req.query;

      const product = await Product.findOneAndUpdate(
        { _id: id, sellerId: req.seller._id, storeId: storeId },
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

router.patch(
  "/products/:id/status",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { storeId, isActive } = req.body;

      const product = await Product.findOneAndUpdate(
        { _id: id, sellerId: req.seller._id, storeId: storeId },
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

router.get(
  "/products/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { storeId } = req.query;

      const product = await Product.findOne({
        _id: id,
        sellerId: req.seller._id,
        storeId: storeId,
        isDeleted: false,
      })
        .populate("mainCategoryId", "name nameAr")
        .populate("sellerCategoryId", "name nameAr");

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, data: { product } });
    } catch (error) {
      console.error("Get product error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch product" });
    }
  },
);
router.put(
  "/products/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const {
        storeId,
        mainCategoryId,
        sellerCategoryId,
        title,
        description,
        price,
        discountPrice,
        quantity,
        brand,
        images,
        isActive,
      } = req.body;

      const product = await Product.findOneAndUpdate(
        { _id: id, sellerId: req.seller._id, storeId: storeId },
        {
          mainCategoryId: mainCategoryId,
          sellerCategoryId,
          title,
          description,
          price,
          discountPrice,
          quantity,
          brand,
          images,
          isActive,
        },
        { new: true },
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  },
);
router.patch(
  "/orders/:id/status",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status, storeId } = req.body;

      if (
        !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
          status,
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const order = await Order.findOne({ _id: id, storeId: storeId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not owned by you",
        });
      }

      order.status = status;
      await order.save();

      const store = await Store.findById(storeId);
      const storeName = store?.name || "Unknown Store";

      const notification = new Notification({
        sellerId: req.seller._id,
        storeId: storeId,
        storeName: storeName,
        type: status === "cancelled" ? "order_cancelled" : "order_updated",
        message: `Order #${order.orderNumber} status updated to ${status} in store "${storeName}"`,
      });
      await notification.save();

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order },
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  },
);

router.get(
  "/notifications",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const notifications = await Notification.find({
        sellerId: req.seller._id,
      })
        .sort({ createdAt: -1 })
        .limit(30);

      res.json({
        success: true,
        data: { notifications },
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  },
);

router.post(
  "/notifications/new-order",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId, orderNumber } = req.body;
      if (!storeId || !orderNumber) {
        return res.status(400).json({
          success: false,
          message: "Store ID and Order Number are required",
        });
      }

      const store = await Store.findById(storeId);
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }

      const notification = new Notification({
        sellerId: req.seller._id,
        storeId: storeId,
        storeName: store.name,
        type: "new_order",
        message: `New order #${orderNumber} placed in "${store.name}"`,
      });
      await notification.save();

      res.json({ success: true, message: "Notification sent" });
    } catch (error) {
      console.error("Create notification error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create notification" });
    }
  },
);

router.get(
  "/orders/:orderId",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { orderId } = req.params;
      const { storeId } = req.query;

      if (!storeId || storeId === "null") {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
        });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
        isDeleted: { $ne: true },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const order = await Order.findOne({
        _id: orderId,
        storeId: storeId,
      }).populate("items.productId", "title images price");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: { order },
      });
    } catch (error) {
      console.error("❌ Get order details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
      });
    }
  },
);

router.patch(
  "/orders/:id/status",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status, storeId } = req.body;

      if (
        !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
          status,
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const order = await Order.findOne({ _id: id, storeId: storeId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not owned by you",
        });
      }

      order.status = status;
      await order.save();

      const store = await Store.findById(storeId);
      const storeName = store?.name || "Unknown Store";

      const notification = new Notification({
        sellerId: req.seller._id,
        storeId: storeId,
        storeName: storeName,
        type: status === "cancelled" ? "order_cancelled" : "order_updated",
        message: `Order #${order.orderNumber} status updated to ${status} in store "${storeName}"`,
      });
      await notification.save();

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order },
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  },
);

router.get(
  "/analytics",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId, period = "30d" } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
        });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
        isDeleted: { $ne: true },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      let days = 30;
      if (period === "7d") days = 7;
      if (period === "90d") days = 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await Order.find({
        storeId: storeId,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: 1 });

      const revenueMap: Record<string, number> = {};
      const ordersMap: Record<string, number> = {};

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const key = date.toISOString().split("T")[0];
        revenueMap[key] = 0;
        ordersMap[key] = 0;
      }

      orders.forEach((order) => {
        if (order.createdAt) {
          const key = order.createdAt.toISOString().split("T")[0];
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += order.totalPrice || 0;
            ordersMap[key] += 1;
          }
        }
      });

      const revenueData = Object.entries(revenueMap).map(([date, revenue]) => ({
        date,
        revenue,
      }));

      const ordersData = Object.entries(ordersMap).map(
        ([date, ordersCount]) => ({
          date,
          orders: ordersCount,
        }),
      );

      const categoryMap: Record<string, number> = {};
      const productIds = store.products || [];
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).populate("mainCategoryId", "name");

      products.forEach((product) => {
        let categoryName = "Uncategorized";
        if (product.mainCategoryId) {
          const category = product.mainCategoryId as any;
          categoryName = category.name || "Uncategorized";
        }
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
      });

      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));

      const statusMap: Record<string, number> = {};
      orders.forEach((order) => {
        statusMap[order.status] = (statusMap[order.status] || 0) + 1;
      });

      const statusData = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      const productSales: Record<
        string,
        { title: string; sold: number; revenue: number; image?: string }
      > = {};

      orders.forEach((order) => {
        order.items.forEach((item: any) => {
          const productId = item.productId?.toString();
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                title: item.title || "Unknown",
                sold: 0,
                revenue: 0,
                image: item.image || "",
              };
            }
            productSales[productId].sold += item.quantity || 1;
            productSales[productId].revenue +=
              item.total || item.price * item.quantity;
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          _id: id,
          ...data,
        }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      const recentOrders = await Order.find({
        storeId: storeId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber totalPrice status createdAt");

      res.json({
        success: true,
        data: {
          revenueData,
          ordersData,
          categoryData,
          statusData,
          topProducts,
          recentOrders,
        },
      });
    } catch (error) {
      console.error("❌ Analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics data",
      });
    }
  },
);

router.get(
  "/categories/store",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const categories = await Category.find({
        type: "store",
        isActive: true,
        isDeleted: false,
      }).sort({ name: 1 });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error("❌ Get store categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch store categories",
      });
    }
  },
);

router.get(
  "/categories/store-main",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeId } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
        });
      }

      const store = await Store.findOne({
        _id: storeId,
        owner: req.seller._id,
        isDeleted: false,
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const storeCategoryIds = store.storeCategoryIds || [];

      if (storeCategoryIds.length === 0) {
        return res.json({
          success: true,
          data: { categories: [] },
        });
      }

      const categories = await Category.find({
        type: "main",
        storeCategoryId: { $in: storeCategoryIds },
        isActive: true,
        isDeleted: false,
      })
        .select("_id name nameAr storeCategoryId")
        .sort({ name: 1 });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error("❌ Get store main categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch store categories",
      });
    }
  },
);
export default router;
