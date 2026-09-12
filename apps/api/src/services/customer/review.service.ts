import { Review } from "../../models/Review.model";
import { Product } from "../../models/Product.model";
import { Store } from "../../models/store.model";

export class ReviewService {
  
  async getReviewsByProduct(productId: string) {
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(20);
    return reviews;
  }

  async addProductReview(
    productId: string,
    guestId: string,
    guestName: string,
    rating: number,
    comment: string,
  ) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const review = new Review({
      productId,
      guestId,
      guestName,
      rating,
      comment,
    });

    await review.save();

    const reviews = await Review.find({ productId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    await product.save();

    return review;
  }

  async getReviewsByStore(storeId: string) {
    const reviews = await Review.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(20);
    return reviews;
  }

  async addStoreReview(
    storeId: string,
    guestId: string,
    guestName: string,
    rating: number,
    comment: string,
  ) {
    const store = await Store.findById(storeId);
    if (!store) throw new Error("Store not found");

    const review = new Review({
      storeId,
      guestId,
      guestName,
      rating,
      comment,
    });

    await review.save();

    const reviews = await Review.find({ storeId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    store.rating = Math.round(avgRating * 10) / 10;
    await store.save();

    return review;
  }
}

export const reviewService = new ReviewService();
