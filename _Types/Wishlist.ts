import { Types } from "mongoose";


export interface Wishlist {
    _id:string,
    user:Types.ObjectId,
    product:Types.ObjectId
}

export type WishlistDocument = Wishlist;