import { Router, Request, Response } from "express";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";
import { Seller } from "../../models/Seller.model";
import { Category } from "../../models/Category.model";
import { SellerCategory } from "../../models/seller-category.model";
import { Product } from "../../models/Product.model";
import { Store } from "../../models/customer-system/store.customer.model";
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
      console.log("🔍 Fetching seller categories for seller:", req.seller._id);

      const sellerCategories = await SellerCategory.find({
        sellerId: req.seller._id,
        isActive: true,
      })
        .populate("mainCategoryId", "name nameAr")
        .sort({ createdAt: -1 });

      console.log("📊 Found seller categories:", sellerCategories.length);

      res.json({
        success: true,
        data: { sellerCategories },
      });
    } catch (error) {
      console.error("Get seller categories error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch seller categories" });
    }
  },
);

router.get(
  "/categories/seller/:mainCategoryId",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { mainCategoryId } = req.params;

      const sellerCategories = await SellerCategory.find({
        sellerId: req.seller._id,
        mainCategoryId,
        isActive: true,
      }).sort({ name: 1 });

      res.json({
        success: true,
        data: { sellerCategories },
      });
    } catch (error) {
      console.error("Get seller categories by main category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch seller categories" });
    }
  },
);

router.post(
  "/categories/seller",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { mainCategoryId, name, nameAr, description } = req.body;

      if (!mainCategoryId || !name) {
        return res.status(400).json({
          success: false,
          message: "Main category ID and name are required",
        });
      }

      const mainCategory = await Category.findById(mainCategoryId);
      if (!mainCategory) {
        return res.status(404).json({
          success: false,
          message: "Main category not found",
        });
      }

      const seller = await Seller.findById(req.seller._id);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      if (!seller.categories.includes(mainCategory.name)) {
        return res.status(403).json({
          success: false,
          message: `You are not authorized to add categories under "${mainCategory.name}". Your allowed categories are: ${seller.categories.join(", ")}`,
        });
      }

      const existing = await SellerCategory.findOne({
        sellerId: req.seller._id,
        mainCategoryId,
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a category with this name under this main category",
        });
      }

      const sellerCategory = new SellerCategory({
        sellerId: req.seller._id,
        mainCategoryId,
        name,
        nameAr,
        description,
        isActive: true,
      });

      await sellerCategory.save();

      res.json({
        success: true,
        message: "Seller category created successfully",
        data: { sellerCategory },
      });
    } catch (error) {
      console.error("Create seller category error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create seller category" });
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
        mainCategoryId,
        sellerCategoryId,
        title,
        description,
        price,
        discountPrice,
        quantity,
        brand,
        images,
      } = req.body;

      const mainCategory = await Category.findById(mainCategoryId);
      if (!mainCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Main category not found" });
      }

      const sellerCategory = await SellerCategory.findOne({
        _id: sellerCategoryId,
        sellerId: req.seller._id,
        mainCategoryId,
      });

      if (!sellerCategory) {
        return res.status(404).json({
          success: false,
          message:
            "Seller category not found or does not belong to this seller",
        });
      }

      const product = new Product({
        sellerId: req.seller._id,
        mainCategoryId,
        sellerCategoryId,
        title,
        description,
        price,
        discountPrice,
        quantity,
        brand,
        images,
        isActive: true,
      });

      await product.save();

      sellerCategory.products.push(product._id);
      await sellerCategory.save();

      res.json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Create product error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create product" });
    }
  },
);

router.get(
  "/products",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const products = await Product.find({
        sellerId: req.seller._id,
        isDeleted: false,
      })
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
  },
);

router.get("/orders", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    res.json({ success: true, data: { orders: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

router.get(
  "/dashboard",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const seller = await Seller.findById(req.seller._id);
      if (!seller) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      const totalProducts = await Product.countDocuments({
        sellerId: req.seller._id,
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
            totalSales: seller.totalSales || 0,
            rating: seller.rating || 0,
            followers: seller.followers || 0,
            totalSellerCategories: totalSellerCategories || 0,
          },
          recentOrders: [],
          topProducts: [],
          seller,
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
      const product = await Product.findOneAndUpdate(
        { _id: id, sellerId: req.seller._id },
        { isDeleted: true }, // ← Soft Delete
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
      const { isActive } = req.body;

      const product = await Product.findOneAndUpdate(
        { _id: id, sellerId: req.seller._id },
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
      const product = await Product.findOne({
        _id: id,
        sellerId: req.seller._id,
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
        { _id: id, sellerId: req.seller._id },
        {
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
        },
        { new: true },
      );

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Update product error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update product" });
    }
  },
);

// --- Seller Store management ---
router.get("/stores", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const stores = await Store.find({
      owner: req.seller._id,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: { stores } });
  } catch (error) {
    console.error("Get seller stores error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
});

router.post(
  "/stores",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const {
        name,
        slug,
        description,
        logo,
        coverImage,
        category,
        location,
        socialLinks,
      } = req.body;
      if (!name || !slug || !category) {
        return res
          .status(400)
          .json({
            success: false,
            message: "name, slug and category are required",
          });
      }

      const existing = await Store.findOne({ slug });
      if (existing)
        return res
          .status(400)
          .json({ success: false, message: "Slug already in use" });

      const store = new Store({
        name,
        slug,
        description: description || "",
        logo,
        coverImage,
        category,
        owner: req.seller._id,
        location: location || {
          address: "N/A",
          city: "N/A",
          state: "N/A",
          country: "N/A",
          coordinates: {},
        },
        socialLinks: socialLinks || {},
        isActive: true,
      });

      await store.save();
      res.json({ success: true, message: "Store created", data: { store } });
    } catch (error) {
      console.error("Create store error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create store" });
    }
  },
);

router.get(
  "/stores/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const store = await Store.findOne({
        _id: id,
        owner: req.seller._id,
        isActive: true,
      });
      if (!store)
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      res.json({ success: true, data: { store } });
    } catch (error) {
      console.error("Get store error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch store" });
    }
  },
);

router.put(
  "/stores/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const store = await Store.findOneAndUpdate(
        { _id: id, owner: req.seller._id },
        updates,
        { new: true },
      );
      if (!store)
        return res
          .status(404)
          .json({
            success: false,
            message: "Store not found or not owned by you",
          });
      res.json({ success: true, message: "Store updated", data: { store } });
    } catch (error) {
      console.error("Update store error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update store" });
    }
  },
);

router.delete(
  "/stores/:id",
  sellerAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const store = await Store.findOneAndUpdate(
        { _id: id, owner: req.seller._id },
        { isActive: false },
        { new: true },
      );
      if (!store)
        return res
          .status(404)
          .json({
            success: false,
            message: "Store not found or not owned by you",
          });
      res.json({ success: true, message: "Store deactivated" });
    } catch (error) {
      console.error("Delete store error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete store" });
    }
  },
);

export default router;
