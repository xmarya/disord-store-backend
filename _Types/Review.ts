import mongoose, { Types } from "mongoose";


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

export interface ReviewMethods {
  calculateRatingsAverage: <T extends ReviewDocument>(Model:mongoose.Model<T>, isDelete?:boolean) => Promise<void>
}

export type ReviewDocument = Review & ReviewMethods & mongoose.Document;
