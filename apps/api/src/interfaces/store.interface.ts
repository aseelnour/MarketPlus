
import { Document, Types } from "mongoose";

export interface IStore extends Document {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  categories: string[];
  owner: Types.ObjectId;
  isDeleted: boolean;
  rating: number;
  totalReviews: number;
  products: Types.ObjectId[];
  followers: string[];
  isVerified: boolean;
  isActive: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  shippingSettings?: {
    cost: number;
    freeShippingThreshold: number;
    deliveryTime: string;
  };
  isFeatured?: boolean;
  paymentMethods?: string[];

  storeCategoryIds?: Types.ObjectId[]; 

  createdAt?: Date;
  updatedAt?: Date;
}
