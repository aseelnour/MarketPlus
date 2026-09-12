
import mongoose, { Schema } from "mongoose";
import { ICart, ICartItem } from "../interfaces/cart.interface";

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const CartSchema = new Schema<ICart>(
  {
    guestId: { type: String, required: true, unique: true, sparse: true },
    items: [CartItemSchema],
  },
  { timestamps: true },
);

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
