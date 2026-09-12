
import mongoose, { Schema } from "mongoose";
import { IWishlist } from "../interfaces/wishlist.interface";

const WishlistSchema = new Schema<IWishlist>(
  {
    guestId: { type: String, required: true, unique: true, sparse: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
