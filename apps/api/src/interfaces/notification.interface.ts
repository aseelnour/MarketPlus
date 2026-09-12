
import { Document, Types } from "mongoose";

export interface INotification extends Document {
  sellerId: Types.ObjectId;
  storeId: Types.ObjectId;
  storeName: string;
  type: "new_order" | "order_updated" | "order_cancelled";
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
