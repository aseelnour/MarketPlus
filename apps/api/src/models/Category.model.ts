
import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interfaces/Category.interface";

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    nameAr: { type: String },
    icon: { type: String },
    description: { type: String },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    type: {
      type: String,
      enum: ["store", "main"],
      default: "main",
    },
    storeCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true },
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
