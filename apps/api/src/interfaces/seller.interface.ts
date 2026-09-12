import { Document, Types } from "mongoose";

export interface ISeller extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  storeCover?: string;
  categories: string[];
  rating: number;
  totalSales: number;
  followers: number;
  isActive: boolean;
  isApproved: boolean;
  status: "pending" | "active" | "suspended" | "rejected";
  address?: {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date | null; 
  notificationSettings: {
    newOrders: Boolean;
    orderUpdates: Boolean;
    customerMessages: Boolean;
    promotions: Boolean;
  };

  comparePassword(candidatePassword: string): Promise<boolean>;
}
