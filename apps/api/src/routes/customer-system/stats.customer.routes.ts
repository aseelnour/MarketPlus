import { Router } from "express";
import { productService } from "../../services/customer/product.customer.service";
import { storeService } from "../../services/customer/store.customer.service";
import { Category } from "../../models/Category.model";

const router = Router();

router.get("/home", async (req, res, next) => {
  try {
    const totalProducts = await productService.countActiveProducts();
    const totalStores = await storeService.countActiveStores();
    const productCategories = await productService.getCategories();
    const averageRating = await productService.getAverageProductRating();

    res.json({
      totalProducts,
      totalStores,
      totalCategories: productCategories.length,
      averageRating,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
