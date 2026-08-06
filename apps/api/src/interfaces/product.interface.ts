import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  sellerId: Types.ObjectId;
  storeId?: Types.ObjectId;
  mainCategoryId: Types.ObjectId;
  sellerCategoryId: Types.ObjectId;
  title: string;
  category?: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  brand?: string;
  images: string[];
  rating: number;
  aiSummary?: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductResponse {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  brand?: string;
  images: string[];
  image?: string;
  rating: number;
  reviews?: number;
  tag?: string;
  seller: {
    id: string;
    name: string;
  };
  store?: {
    id?: string;
    name?: string;
    slug?: string;
    image?: string;
  };
  category: {
    id: string;
    name: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: Date;
}

export interface IProductFilter {
  storeId?: string;
  sellerId?: string;
  category?: string;

  mainCategoryId?: string;
  sellerCategoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: "price" | "rating" | "createdAt" | "views";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
