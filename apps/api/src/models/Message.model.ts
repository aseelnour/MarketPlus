
import mongoose, { Schema } from "mongoose";
import { IMessage } from "../interfaces/message.interface";

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: String, required: true },
    senderType: { type: String, enum: ["customer", "seller"], required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
