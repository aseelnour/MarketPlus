
import { Document, Types } from "mongoose";

export interface IConversation extends Document {
  orderId: Types.ObjectId;
  orderNumber: string;
  customerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  storeId: Types.ObjectId;
  storeName: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCustomer: number;
  unreadSeller: number;
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
}
