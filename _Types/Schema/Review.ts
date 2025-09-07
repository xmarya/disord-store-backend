import mongoose from "mongoose";
import { Model } from "./Model";
import { MongoId } from "./MongoId";
import { UserTypes } from "./Users/BasicUserTypes";

interface SharedReviewDataBody {
  writer: MongoId;
  userType: Extract<UserTypes, "user">;
  firstName: string;
  lastName: string;
  image?: string;
}

export interface ReviewDataBody extends SharedReviewDataBody {
  storeOrProduct: Extract<Model, "Store" | "Product">;
  reviewedResourceId: MongoId;
  reviewBody: string;
  rating: number;
}

export interface ReviewDocument extends ReviewDataBody, mongoose.Document {
  displayInStorePage: boolean;
  storeReply: string;
}

/* OLD CODE (kept for reference): 
export interface ReviewModel extends mongoose.Model<ReviewDocument> {
  calculateRatingsAverage:(modelId:string, isDelete?:boolean) => Promise<void>
}
*/

export interface PlatformReviewDataBody extends SharedReviewDataBody {
  writer: MongoId;
  reviewBody: string;
}

interface PlatformReview extends PlatformReviewDataBody {
  displayInHomePage: boolean;
}

export type PlatformReviewDocument = PlatformReview & mongoose.Document;
