
import { Document, Types } from "mongoose";

export interface IWishlist extends Document {
  guestId: string;
  items: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
