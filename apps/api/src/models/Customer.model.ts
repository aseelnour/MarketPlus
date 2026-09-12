
import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../interfaces/customer.interface";

const CustomerSchema = new Schema<ICustomer>(
  {
    guestId: { type: String, unique: true, sparse: true }, 
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    firstOrderAt: { type: Date, default: Date.now },
    lastOrderAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  {
    timestamps: true,
  },
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ fullName: 1 });

CustomerSchema.index({ guestId: 1 }, { unique: false });
CustomerSchema.index({ email: 1 });
export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
