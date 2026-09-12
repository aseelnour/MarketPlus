import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IAdmin } from "../interfaces/admin.interface";

const AdminSchema = new Schema<IAdmin>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "admin"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    siteName: { type: String, default: "MarketPlus" },
    siteEmail: { type: String, default: "admin@marketplus.com" },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" },
    maintenanceMode: { type: Boolean, default: false },
    notificationSettings: {
      newOrders: { type: Boolean, default: true },
      newSellers: { type: Boolean, default: true },
      storeApprovals: { type: Boolean, default: true },
      dailyReports: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

AdminSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
