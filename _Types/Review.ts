import mongoose, { Types } from "mongoose";


export interface ReviewDataBody {
  user: Types.ObjectId |string;
  reviewBody: string;
  rating:number,
  // reviewedResource: Extract<DynamicModel, "Store" | "Product">;
}
export interface PlatformReviewDataBody {
  user: Types.ObjectId |string;
  reviewBody: string;
}

interface PlatformReview extends PlatformReviewDataBody{
  id: Types.ObjectId;
  wroteAt: Date;
  updatedAt: Date;
}

export interface ReviewDocument extends ReviewDataBody, mongoose.Document {
  id: Types.ObjectId;
  wroteAt: Date;
  updatedAt: Date;
}

export interface ReviewModel extends mongoose.Model<ReviewDocument> {
  calculateRatingsAverage:(isDelete?:boolean) => Promise<void>
}


// export type ReviewDocument = Review & mongoose.Document;
export type PlatformReviewDocument = PlatformReview & mongoose.Document;
