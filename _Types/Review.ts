import mongoose from "mongoose";
import { Model } from "./Model";
import { MongoId } from "./MongoId";

export interface ReviewDataBody {
  writer: MongoId,
  storeOrProduct: Extract<Model, "Store" | "Product">,
  reviewedResourceId: MongoId,
  reviewBody:string,
  rating:number
} 

export interface ReviewDocument extends ReviewDataBody, mongoose.Document{
  displayInStorePage: boolean,
  storeReply:string,
}

/* OLD CODE (kept for reference): 
export interface ReviewModel extends mongoose.Model<ReviewDocument> {
  calculateRatingsAverage:(modelId:string, isDelete?:boolean) => Promise<void>
}
*/

export interface PlatformReviewDataBody {
  user: MongoId;
  reviewBody: string;
}

interface PlatformReview extends PlatformReviewDataBody{
  displayInHomePage: boolean,
}

export type PlatformReviewDocument = PlatformReview & mongoose.Document;
