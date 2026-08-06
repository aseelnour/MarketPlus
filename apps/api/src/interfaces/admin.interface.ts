import { Document, Types } from "mongoose";
export interface IAdmin extends Document {
  _id: Types.ObjectId;
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

  comparePassword(candidatePassword: string): Promise<boolean>;
}
