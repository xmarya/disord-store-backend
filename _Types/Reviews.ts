import { Types } from "mongoose";


export interface ReviewDataBody {
  user: Types.ObjectId |string;
  reviewBody: string;
  rating:number
}
export interface Review extends ReviewDataBody {
  id: Types.ObjectId;
  wroteAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = Review;
