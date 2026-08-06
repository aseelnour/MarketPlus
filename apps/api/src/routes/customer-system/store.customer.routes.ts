import { Router } from "express";
import { storeService } from "../../services/customer/store.customer.service";
import { authMiddleware } from "../../middlewares/customer-system/auth.middleware.customer";

const router = Router();

// Get all stores
router.get("/", async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
      isVerified: req.query.isVerified === "true" ? true : undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    };

    const result = await storeService.getStores(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get featured stores
router.get("/featured", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const stores = await storeService.getFeaturedStores(limit);
    res.json({ stores });
  } catch (error) {
    next(error);
  }
});

// Get store categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await storeService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// Get store by slug
router.get("/slug/:slug", async (req, res, next) => {
  try {
    const store = await storeService.getStoreBySlug(req.params.slug);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// Get store by ID
router.get("/:id", async (req, res, next) => {
  try {
    const store = await storeService.getStoreById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    res.json({ store });
  } catch (error) {
    next(error);
  }
});

// Follow store (Protected)
router.post("/:id/follow", authMiddleware, async (req: any, res, next) => {
  try {
    const isFollowing = await storeService.followStore(
      req.params.id,
      req.customer._id,
    );
    res.json({ isFollowing });
  } catch (error) {
    next(error);
  }
});

export default router;
