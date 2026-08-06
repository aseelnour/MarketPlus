import { Document, Types } from "mongoose";

export interface IStore extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  categories: string[];
  owner: Types.ObjectId;
  rating: number;
  totalReviews: number;
  products: Types.ObjectId[];
  followers: Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  category: string;
  categories?: string[];
  rating: number;
  totalReviews: number;
  productsCount: number;
  products?: number;
  followersCount: number;
  followers?: number;
  image?: string;
  isVerified: boolean;
  isActive: boolean;
  location: IStore["location"];
  socialLinks?: IStore["socialLinks"];
  createdAt: Date;
}

export interface IStoreFilter {
  category?: string;
  search?: string;
  isVerified?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
}
