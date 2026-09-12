
import { Document, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  guestId: string;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
