
import mongoose, { Schema } from "mongoose";
import { IReview } from "../interfaces/review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: false,
    },
    guestId: { type: String, required: true },
    guestName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ storeId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
