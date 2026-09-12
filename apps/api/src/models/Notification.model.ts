
import mongoose, { Schema } from "mongoose";
import { INotification } from "../interfaces/notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    storeName: { type: String, required: true },
    type: {
      type: String,
      enum: ["new_order", "order_updated", "order_cancelled"],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
