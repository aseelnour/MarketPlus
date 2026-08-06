import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Customer } from "../../models/customer-system/customer.model";

export interface AuthRequest extends Request {
  customer?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
    ) as { id: string; role: string };

    if (decoded.role !== "customer") {
      throw new Error("Invalid role");
    }

    const customer = await Customer.findById(decoded.id);

    if (!customer || !customer.isActive) {
      throw new Error();
    }

    req.customer = customer;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
