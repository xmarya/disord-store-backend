import { Types } from "mongoose";

export interface Wishlist {
  id: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
}

export type WishlistDocument = Wishlist;
