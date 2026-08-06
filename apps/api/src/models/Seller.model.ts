import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ISeller } from "../interfaces/seller.interface";
const SellerSchema = new Schema<ISeller>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    avatar: { type: String },
    storeName: { type: String, required: true, unique: true },
    storeDescription: { type: String },
    storeLogo: { type: String },
    storeCover: { type: String },
    categories: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      whatsapp: { type: String },
    },
    lastLogin: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

SellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
SellerSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const Seller = mongoose.model<ISeller>("Seller", SellerSchema);
