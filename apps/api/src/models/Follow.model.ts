
import mongoose, { Schema } from "mongoose";
import { IFollow } from "../interfaces/follow.interface";

const FollowSchema = new Schema<IFollow>(
  {
    guestId: { type: String, required: true, unique: true, sparse: true },
    storeIds: [{ type: Schema.Types.ObjectId, ref: "Store" }],
  },
  { timestamps: true },
);

export const Follow = mongoose.model<IFollow>("Follow", FollowSchema);
