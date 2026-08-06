import mongoose, { Schema, Document } from "mongoose";

import { ISellerCategory } from "../interfaces/seller-category.interface";

const SellerCategorySchema = new Schema<ISellerCategory>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    mainCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

SellerCategorySchema.index(
  { sellerId: 1, mainCategoryId: 1, name: 1 },
  { unique: true },
);

export const SellerCategory = mongoose.model<ISellerCategory>(
  "SellerCategory",
  SellerCategorySchema,
);
