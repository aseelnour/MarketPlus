import { Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  title: string;
  quantity: number;
  price: number;
  total: number;
  isDeleted?: boolean;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customerId: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cash" | "credit_card" | "paypal" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    fullName: string;
  };
  notes?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
