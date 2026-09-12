
import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Seller } from "../../models/Seller.model";
import { Category } from "../../models/Category.model";
import { Product } from "../../models/Product.model";
import { Order } from "../../models/Order.model";
import { Store } from "../../models/store.model";
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
        message: `New seller registered: ${seller.firstName || "Seller"}`,
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

    const sellersWithStores = await Promise.all(
      sellers.map(async (seller) => {
        
        const store = await Store.findOne({
          owner: seller._id,
          isDeleted: false,
        })
          .select(
            "name description storeCategoryIds categories isActive isVerified",
          )
          .populate("storeCategoryIds", "name nameAr icon"); 

        const categoriesFull = store?.storeCategoryIds || [];

        return {
          ...seller.toObject(),
          storeName: store?.name || seller.storeName || null,
          storeDescription: store?.description || null,
          storeCategoryIds: store?.storeCategoryIds || [],
          categories: categoriesFull, 
          isActive: store?.isActive || false,
          isVerified: store?.isVerified || false,
        };
      }),
    );

    const total = await Seller.countDocuments(filter);
    const pending = await Seller.countDocuments({ status: "pending" });
    const active = await Seller.countDocuments({ status: "active" });
    const rejected = await Seller.countDocuments({ status: "rejected" });
    const suspended = await Seller.countDocuments({ status: "suspended" });

    res.json({
      success: true,
      data: {
        sellers: sellersWithStores,
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch sellers",
    });
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
      const { id } = req.params;

      const seller = await Seller.findById(id);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      seller.isDeleted = true;
      seller.deletedAt = new Date();
      seller.status = "suspended";
      seller.isApproved = false;
      await seller.save();

      const store = await Store.findOneAndUpdate(
        { owner: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
        { new: true },
      );

      if (store) {
        await Product.updateMany(
          { storeId: store._id },
          {
            isDeleted: true,
            isActive: false,
          },
        );
      }

      res.json({
        success: true,
        message: "Seller and associated store deleted successfully",
        data: {
          seller: {
            _id: seller._id,
            isDeleted: seller.isDeleted,
            status: seller.status,
          },
          store: store
            ? {
                _id: store._id,
                name: store.name,
                isDeleted: store.isDeleted,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("❌ Delete seller error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete seller",
      });
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
      filter.$or = [
        { mainCategoryId: categoryId }, 
        { sellerCategoryId: categoryId },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    let products = await Product.find(filter)
      .populate("sellerId", "storeName firstName lastName email")
      .populate({
        path: "mainCategoryId", 
        select: "name nameAr",
        match: { isDeleted: false },
      })
      .populate({
        path: "sellerCategoryId",
        select: "name nameAr",
        match: { isDeleted: false },
      })
      .sort({ createdAt: -1 });

    const processedProducts = await Promise.all(
      products.map(async (product: any) => {
        
        let storeName = "Unknown Store";
        if (product.sellerId) {
          const store = await Store.findOne({
            owner: product.sellerId._id,
            isDeleted: false,
          });
          storeName =
            store?.name ||
            product.sellerId?.storeName ||
            `${product.sellerId?.firstName || ""} ${product.sellerId?.lastName || ""}`.trim() ||
            "Unknown Store";
        }

        let mainCategory = null;
        if (product.mainCategoryId) {
          if (
            typeof product.mainCategoryId === "object" &&
            product.mainCategoryId !== null
          ) {
            mainCategory = {
              _id: product.mainCategoryId._id,
              name: product.mainCategoryId.name || "Unknown",
              nameAr: product.mainCategoryId.nameAr || "",
            };
          } else {
            const category = await Category.findById(product.mainCategoryId)
              .select("name nameAr")
              .lean();
            if (category) {
              mainCategory = {
                _id: category._id,
                name: category.name || "Unknown",
                nameAr: category.nameAr || "",
              };
            }
          }
        }

        let sellerCategory = null;
        if (product.sellerCategoryId) {
          if (
            typeof product.sellerCategoryId === "object" &&
            product.sellerCategoryId !== null
          ) {
            sellerCategory = {
              _id: product.sellerCategoryId._id,
              name: product.sellerCategoryId.name || "Unknown",
              nameAr: product.sellerCategoryId.nameAr || "",
            };
          } else {
            const category = await Category.findById(product.sellerCategoryId)
              .select("name nameAr")
              .lean();
            if (category) {
              sellerCategory = {
                _id: category._id,
                name: category.name || "Unknown",
                nameAr: category.nameAr || "",
              };
            }
          }
        }

        return {
          ...product.toObject(),
          storeName,
          mainCategoryId: mainCategory || null,
          sellerCategoryId: sellerCategory || null,
          categoryName: mainCategory?.name || sellerCategory?.name || "Unknown",
          categoryNameAr: mainCategory?.nameAr || sellerCategory?.nameAr || "",
        };
      }),
    );

    res.json({
      success: true,
      data: { products: processedProducts },
    });
  } catch (error) {
    console.error("❌ Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
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
    const { type } = req.query;
    let filter: any = { isActive: true, isDeleted: false };

    if (type && ["main", "store"].includes(type as string)) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

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
    const { name, nameAr, icon, description, storeCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const type = storeCategoryId ? "main" : "store";

    if (type === "main" && !storeCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Store Category ID is required for main categories",
      });
    }

    const existingQuery: any = { name, type };
    if (type === "main") {
      existingQuery.storeCategoryId = storeCategoryId;
    }

    const existing = await Category.findOne(existingQuery);
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          type === "main"
            ? "Main category already exists under this store category"
            : "Store category already exists",
      });
    }

    if (type === "main") {
      const storeCategory = await Category.findOne({
        _id: storeCategoryId,
        type: "store",
        isActive: true,
        isDeleted: false,
      });

      if (!storeCategory) {
        return res.status(404).json({
          success: false,
          message: "Store category not found",
        });
      }
    }

    const category = new Category({
      name,
      nameAr,
      icon,
      description,
      type,
      storeCategoryId: type === "main" ? storeCategoryId : undefined,
      isActive: true,
    });

    await category.save();

    res.json({
      success: true,
      message: `${type === "main" ? "Main" : "Store"} category created successfully`,
      data: { category },
    });
  } catch (error) {
    console.error("❌ Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
});

router.put(
  "/categories/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameAr, icon, description, isActive, storeCategoryId } =
        req.body;

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (existingCategory.type === "main" && storeCategoryId) {
        const storeCategory = await Category.findOne({
          _id: storeCategoryId,
          type: "store",
          isActive: true,
          isDeleted: false,
        });

        if (!storeCategory) {
          return res.status(404).json({
            success: false,
            message: "Store category not found",
          });
        }
      }

      const updateData: any = {
        name,
        nameAr,
        icon,
        description,
        isActive,
      };

      if (existingCategory.type === "main" && storeCategoryId) {
        updateData.storeCategoryId = storeCategoryId;
      }

      const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.json({
        success: true,
        message: "Category updated successfully",
        data: { category },
      });
    } catch (error) {
      console.error("❌ Update category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update category",
      });
    }
  },
);

router.delete(
  "/categories/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (category.type === "store") {
        const hasMainCategories = await Category.exists({
          storeCategoryId: id,
          type: "main",
          isDeleted: false,
        });

        if (hasMainCategories) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete store category with existing main categories",
          });
        }
      }

      const deletedCategory = await Category.findByIdAndUpdate(
        id,
        { isActive: false, isDeleted: true },
        { new: true },
      );

      res.json({
        success: true,
        message: `${category.type === "main" ? "Main" : "Store"} category deleted successfully`,
      });
    } catch (error) {
      console.error("❌ Delete category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete category",
      });
    }
  },
);

router.get(
  "/categories/store",
  authMiddleware,
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
  "/categories/main",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const categories = await Category.find({
        type: "main",
        isActive: true,
        isDeleted: false,
      }).sort({ name: 1 });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error("❌ Get main categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch main categories",
      });
    }
  },
);

router.get(
  "/categories/main/:storeCategoryId",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { storeCategoryId } = req.params;

      const categories = await Category.find({
        type: "main",
        storeCategoryId: storeCategoryId,
        isActive: true,
        isDeleted: false,
      }).sort({ name: 1 });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error("❌ Get main categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch main categories",
      });
    }
  },
);

router.post(
  "/categories/store",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { name, nameAr, icon, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const existing = await Category.findOne({ name, type: "store" });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Store category already exists",
        });
      }

      const category = new Category({
        name,
        nameAr,
        icon,
        description,
        type: "store",
        isActive: true,
      });

      await category.save();

      res.json({
        success: true,
        message: "Store category created successfully",
        data: { category },
      });
    } catch (error) {
      console.error("❌ Create store category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create store category",
      });
    }
  },
);

router.post(
  "/categories/main",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { name, nameAr, icon, description, storeCategoryId } = req.body;

      if (!name || !storeCategoryId) {
        return res.status(400).json({
          success: false,
          message: "Name and Store Category ID are required",
        });
      }

      const storeCategory = await Category.findOne({
        _id: storeCategoryId,
        type: "store",
        isActive: true,
        isDeleted: false,
      });

      if (!storeCategory) {
        return res.status(404).json({
          success: false,
          message: "Store category not found",
        });
      }

      const existing = await Category.findOne({
        name,
        type: "main",
        storeCategoryId,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Main category already exists under this store category",
        });
      }

      const category = new Category({
        name,
        nameAr,
        icon,
        description,
        type: "main",
        storeCategoryId,
        isActive: true,
      });

      await category.save();

      res.json({
        success: true,
        message: "Main category created successfully",
        data: { category },
      });
    } catch (error) {
      console.error("❌ Create main category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create main category",
      });
    }
  },
);

router.put(
  "/categories/store/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameAr, icon, description, isActive } = req.body;

      const category = await Category.findOneAndUpdate(
        { _id: id, type: "store" },
        { name, nameAr, icon, description, isActive },
        { new: true },
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Store category not found",
        });
      }

      res.json({
        success: true,
        message: "Store category updated successfully",
        data: { category },
      });
    } catch (error) {
      console.error("❌ Update store category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update store category",
      });
    }
  },
);

router.delete(
  "/categories/store/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const hasMainCategories = await Category.exists({
        storeCategoryId: id,
        type: "main",
        isDeleted: false,
      });

      if (hasMainCategories) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete store category with existing main categories",
        });
      }

      const category = await Category.findOneAndUpdate(
        { _id: id, type: "store" },
        { isActive: false, isDeleted: true },
        { new: true },
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Store category not found",
        });
      }

      res.json({
        success: true,
        message: "Store category deleted successfully",
      });
    } catch (error) {
      console.error("❌ Delete store category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete store category",
      });
    }
  },
);

router.delete(
  "/categories/main/:id",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const category = await Category.findOneAndUpdate(
        { _id: id, type: "main" },
        { isActive: false, isDeleted: true },
        { new: true },
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Main category not found",
        });
      }

      res.json({
        success: true,
        message: "Main category deleted successfully",
      });
    } catch (error) {
      console.error("❌ Delete main category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete main category",
      });
    }
  },
);

router.get("/orders", authMiddleware, async (req: any, res: Response) => {
  try {
    const orders = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "customers", 
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } }, 
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      storeId: order.store || null,
      customerId: order.customer || null, 
      items: order.items.map((item: any) => {
        const product = order.productDetails.find(
          (p: any) => p._id.toString() === item.productId.toString(),
        );
        return {
          ...item,
          productId: product || null,
        };
      }),
    }));

    res.json({
      success: true,
      data: { orders: formattedOrders },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

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
