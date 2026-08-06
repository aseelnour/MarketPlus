import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  parentCategoryId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  isDeleted: boolean;
}
