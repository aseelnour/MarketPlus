
import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  fullName: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  orderCount: number;
  guestId: string;
  totalSpent: number;
  firstOrderAt: Date;
  lastOrderAt: Date;
  notes?: string;
  createdAt: Date; 
  updatedAt: Date; 
}

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      zipCode: { type: String, default: "" },
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    firstOrderAt: {
      type: Date,
      default: Date.now,
    },
    lastOrderAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, 
  },
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ fullName: 1 });
CustomerSchema.index({ createdAt: -1 });

CustomerSchema.pre("save", function (next) {
  if (this.isNew) {
    this.firstOrderAt = new Date();
  }
  this.lastOrderAt = new Date();
  next();
});

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
