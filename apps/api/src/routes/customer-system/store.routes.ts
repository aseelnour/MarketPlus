
import { Router } from "express";
import { customerStoreService } from "../../services/customer/store.service";
import { Product } from "../../models/Product.model";
import { Store } from "../../models/store.model";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await customerStoreService.getAllStores({
      search,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const stores = await customerStoreService.getFeaturedStores(limit);
    res.json({ success: true, data: { stores } });
  } catch (error) {
    console.error("Get featured stores error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch featured stores" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { category, search, storeId, limit = 12, page = 1 } = req.query;

    let filter: any = { isDeleted: false, isActive: true };

    if (storeId) {
      filter.storeId = storeId;
    }

    if (category && category !== "all") {
      filter.mainCategoryId = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("storeId", "name logo")
      .populate("mainCategoryId", "name nameAr")
      .populate("sellerCategoryId", "name nameAr")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

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
});

router.get("/:storeId/products", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const products = await Product.find({
      storeId: storeId,
      isActive: true,
      isDeleted: false,
    })
      .populate("storeId", "name logo")
      .populate("mainCategoryId", "name nameAr")
      .populate("sellerCategoryId", "name nameAr")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments({
      storeId: storeId,
      isActive: true,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: { products, total },
    });
  } catch (error) {
    console.error("❌ Get store products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store products",
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await customerStoreService.getCategories();
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error("Get categories error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [storesCount, productsCount, ratingAggregation] = await Promise.all([
      Store.countDocuments({ isActive: true, isDeleted: false }),
      Product.countDocuments({ isActive: true, isDeleted: false }),
      Store.aggregate([
        { $match: { isActive: true, isDeleted: false } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    const avgRating = ratingAggregation[0]?.avgRating || 0;

    res.json({
      success: true,
      data: {
        activeStores: storesCount,
        totalProducts: productsCount,
        avgRating: Number(avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("storeId", "name logo")
      .populate("mainCategoryId", "name nameAr");
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
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [], products: [] },
      });
    }

    const regex = new RegExp(q, "i");

    const products = await Product.find({
      $or: [{ title: regex }, { description: regex }],
      isActive: true,
      isDeleted: false,
    })
      .populate("storeId", "name logo")
      .select("title images price discountPrice rating storeId")
      .limit(5);

    const suggestions = [
      { id: "1", text: q },
      { id: "2", text: `${q} pro` },
      { id: "3", text: `${q} max` },
    ];

    res.json({
      success: true,
      data: { suggestions, products },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      isActive: true,
      isDeleted: false,
    })
      .populate("owner", "firstName lastName email")
      .populate("products", "title price images rating");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: { store },
    });
  } catch (error) {
    console.error("Get store error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
    });
  }
});

export default router;
