
import { Document } from "mongoose";

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "super_admin" | "admin";
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
  createdAt: Date;
  isDeleted: boolean;

  siteName?: string;
  siteEmail?: string;
  currency?: string;
  timezone?: string;
  maintenanceMode?: boolean;
  notificationSettings?: {
    newOrders: boolean;
    newSellers: boolean;
    storeApprovals: boolean;
    dailyReports: boolean;
  };

  comparePassword(candidatePassword: string): Promise<boolean>;
}
