
import mongoose, { Schema } from "mongoose";
import { IConversation } from "../interfaces/conversation.interface";

const ConversationSchema = new Schema<IConversation>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    storeName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCustomer: { type: Number, default: 0 },
    unreadSeller: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true },
);

ConversationSchema.index({ orderId: 1 });
ConversationSchema.index({ customerId: 1 });
ConversationSchema.index({ sellerId: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ storeId: 1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema,
);
