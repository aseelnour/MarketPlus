
import { Document, Types } from "mongoose";

export interface IReview extends Document {
  productId?: Types.ObjectId;
  storeId?: Types.ObjectId;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
