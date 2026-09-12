import { Seller } from "../../models/Seller.model";
import jwt from "jsonwebtoken";

export class SellerAuthService {
  static async register(data: any) {
    try {
      const existingSeller = await Seller.findOne({ email: data.email });
      if (existingSeller) {
        return {
          success: false,
          message: "Seller with this email already exists.",
        };
      }

      const seller = new Seller({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        storeName: data.storeName || null,
        storeDescription: data.storeDescription || null,
        categories: data.categories || [],
        address: data.address,
        socialMedia: data.socialMedia,
        status: "pending",
      });

      await seller.save();

      const token = jwt.sign(
        { id: seller._id, email: seller.email, role: "seller" },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      );

      return {
        success: true,
        message: "Seller registered successfully. Waiting for admin approval.",
        data: {
          token,
          seller: {
            id: seller._id.toString(),
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email,
            storeName: seller.storeName,
            categories: seller.categories,
            status: seller.status,
          },
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  static async login(data: any) {
    try {
      const seller = await Seller.findOne({ email: data.email });
      if (!seller) {
        return { success: false, message: "Invalid email or password." };
      }

      if (seller.status === "suspended" || seller.status === "rejected") {
        return {
          success: false,
          message: "Your account is suspended or rejected.",
        };
      }

      if (seller.status === "pending") {
        return {
          success: false,
          message: "Your account is pending admin approval.",
        };
      }

      const isPasswordValid = await seller.comparePassword(data.password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid email or password." };
      }

      seller.lastLogin = new Date();
      await seller.save();

      const token = jwt.sign(
        { id: seller._id, email: seller.email, role: "seller" },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      );

      return {
        success: true,
        message: "Login successful.",
        data: {
          token,
          seller: {
            id: seller._id.toString(),
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email,
            storeName: seller.storeName,
            categories: seller.categories,
            status: seller.status,
            isApproved: seller.isApproved,
            rating: seller.rating,
            totalSales: seller.totalSales,
          },
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  }

  static async getProfile(sellerId: string) {
    try {
      const seller = await Seller.findById(sellerId).select("-password");
      if (!seller) {
        return { success: false, message: "Seller not found." };
      }

      return {
        success: true,
        message: "Profile retrieved successfully.",
        data: { seller },
      };
    } catch (error) {
      return { success: false, message: "Failed to retrieve profile." };
    }
  }

  static async getDashboardStats(sellerId: string) {
    try {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return { success: false, message: "Seller not found." };
      }

      return {
        success: true,
        data: {
          stats: {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalSales: seller.totalSales || 0,
            rating: seller.rating || 0,
            followers: seller.followers || 0,
          },
          recentOrders: [],
          topProducts: [],
          seller,
        },
      };
    } catch (error) {
      return { success: false, message: "Failed to fetch dashboard data." };
    }
  }
}
