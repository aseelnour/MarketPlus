import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../interfaces/product.interface";

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    mainCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    sellerCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SellerCategory",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    brand: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    aiSummary: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    storeCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ sellerId: 1, mainCategoryId: 1, sellerCategoryId: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
