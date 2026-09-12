
import { Schema, model } from "mongoose";
import { IStore } from "../interfaces/store.interface";

const StoreSchema = new Schema<IStore>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    logo: { type: String },
    coverImage: { type: String },
    categories: { type: [String], required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    isDeleted: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Customer" }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    
    storeCategoryIds: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    
    shippingSettings: {
      cost: { type: Number, default: 0 },
      freeShippingThreshold: { type: Number, default: 0 },
      deliveryTime: { type: String, default: "3-5 days" },
    },
    paymentMethods: {
      type: [String],
      default: ["Cash on Delivery", "Credit Card"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

StoreSchema.index({ name: "text", description: "text" });
StoreSchema.index({ slug: 1 }, { unique: true });

export const Store = model<IStore>("Store", StoreSchema);
