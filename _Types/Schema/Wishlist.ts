import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export interface WishlistDataBody {
  products: Array<MongoId>;
}

export type WishlistDocument = { user: MongoId; product: MongoId } & mongoose.Document;
