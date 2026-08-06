import mongoose, { Schema, Document } from "mongoose";

export interface ISellerCategory extends Document {
  sellerId: mongoose.Types.ObjectId;
  mainCategoryId: mongoose.Types.ObjectId;
  name: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
  products: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
