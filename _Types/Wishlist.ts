import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export interface WishlistDataBody {
  user: MongoId;
  product: MongoId;
}

export type WishlistDocument = WishlistDataBody & mongoose.Document;
