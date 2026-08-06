import { Router } from "express";
import { productService } from "../../services/customer/product.customer.service";

const router = Router();

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category as string,
      subcategory: req.query.subcategory as string,
      storeId: req.query.storeId as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      isOnSale: req.query.isOnSale === "true" ? true : undefined,
      isFeatured: req.query.isFeatured === "true" ? true : undefined,
      sortBy: (req.query.sortBy as any) || "createdAt",
      sortOrder: (req.query.sortOrder as any) || "desc",
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    };

    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get featured products
router.get("/featured", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await productService.getFeaturedProducts(limit);
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// Search products
router.get("/search", async (req, res, next) => {
  try {
    const searchTerm = req.query.q as string;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const products = await productService.searchProducts(searchTerm, limit);
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// Get product categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// Get product subcategories
router.get("/subcategories", async (req, res, next) => {
  try {
    const category = req.query.category as string;
    const subcategories = await productService.getSubcategories(category);
    res.json({ subcategories });
  } catch (error) {
    next(error);
  }
});

// Get products by store
router.get("/store/:storeId", async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category as string,
      subcategory: req.query.subcategory as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      isOnSale: req.query.isOnSale === "true" ? true : undefined,
      isFeatured: req.query.isFeatured === "true" ? true : undefined,
      sortBy: (req.query.sortBy as any) || "createdAt",
      sortOrder: (req.query.sortOrder as any) || "desc",
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    };

    const result = await productService.getProductsByStore(
      req.params.storeId,
      filters,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get("/:id", async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;
