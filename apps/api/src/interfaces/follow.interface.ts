
import { Document, Types } from "mongoose";

export interface IFollow extends Document {
  guestId: string;
  storeIds: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
