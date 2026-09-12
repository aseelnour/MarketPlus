
import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  parentCategoryId?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  type: "store" | "main"; 
  storeCategoryId?: Types.ObjectId; 
}
