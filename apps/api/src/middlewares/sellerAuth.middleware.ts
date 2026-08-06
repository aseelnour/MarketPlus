import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Seller } from "../models/Seller.model";

export interface SellerRequest extends Request {
  seller?: any;
}

export const sellerAuthMiddleware = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Seller not found.",
      });
    }

    if (seller.status === "suspended" || seller.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended or rejected.",
      });
    }

    if (seller.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    req.seller = seller;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    console.error("Seller Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
