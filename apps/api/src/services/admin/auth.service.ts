import { Admin } from "../../models/Admin.model";
import jwt from "jsonwebtoken";
import {
  IRegisterAdmin,
  ILoginAdmin,
  IAuthResponse,
} from "../../interfaces/auth.interface";

export class AdminAuthService {
  static async register(data: IRegisterAdmin): Promise<IAuthResponse> {
    try {
      const existingAdmin = await Admin.findOne({ email: data.email });
      if (existingAdmin) {
        return {
          success: false,
          message: "Admin with this email already exists.",
        };
      }

      const admin = new Admin({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role || "admin",
      });

      await admin.save();

      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d" },
      );

      return {
        success: true,
        message: "Admin registered successfully.",
        data: {
          token,
          admin: {
            id: admin._id.toString(),
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  static async login(data: ILoginAdmin): Promise<IAuthResponse> {
    try {
      const admin = await Admin.findOne({ email: data.email });
      if (!admin) {
        return { success: false, message: "Invalid email or password." };
      }

      if (admin.status === "suspended" || admin.status === "inactive") {
        return {
          success: false,
          message: "Your account is suspended or inactive.",
        };
      }

      const isPasswordValid = await admin.comparePassword(data.password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid email or password." };
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d" },
      );

      return {
        success: true,
        message: "Login successful.",
        data: {
          token,
          admin: {
            id: admin._id.toString(),
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar,
          },
        },
      };
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." };
    }
  }

  static async getProfile(adminId: string) {
    try {
      const admin = await Admin.findById(adminId).select("-password");
      if (!admin) {
        return { success: false, message: "Admin not found." };
      }

      return {
        success: true,
        message: "Profile retrieved successfully.",
        data: {
          admin: {
            id: admin._id.toString(),
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar,
            phone: admin.phone,
            status: admin.status,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt,
          },
        },
      };
    } catch (error) {
      return { success: false, message: "Failed to retrieve profile." };
    }
  }
}
