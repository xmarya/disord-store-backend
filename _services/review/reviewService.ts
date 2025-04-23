import mongoose from "mongoose";
import { ProductDocument } from "../../_Types/Product";
import { PlatformReviewDocument } from "../../_Types/Review";
import PlatformReview from "../../models/platformReviewModel";

export async function createPlatformReview(data: any): Promise<PlatformReviewDocument> {
  console.log("createPlatformReview service");
  const newDoc = await PlatformReview.create(data);
  return newDoc;
}

export async function confirmReviewAuthorisation<T extends mongoose.Document>(Model: mongoose.Model<T>, reviewId: string, userId: string): Promise<boolean> {
  console.log("confirmReviewAuthorisation", Model, reviewId);
  const authorised = await Model.exists({ _id: reviewId, user: userId });

  return !!authorised;
}

export async function updateModelRating<T extends ProductDocument>(Model:mongoose.Model<T>, resourceId: string, stats: Array<any>, session:mongoose.ClientSession) {
  console.log("insid e updateModelRating");
  const doc = await Model.findById(resourceId);

  // const collection = resourceName.concat(`s-${modelId}`);
  // const doc = await mongoose.connection.collection(collection).findOne({_id: new mongoose.Types.ObjectId(resourceId)}) as ProductDocument; // this is what I want, it asks the db directly about the existing collections

  // STEP 1) update the resource ratingsAverage and ratingsQuantity: (whether an update or delete)
  doc!.ratingsAverage = stats[0].ratingsAverage;
  doc!.ratingsQuantity = stats[0].ratingsQuantity;

  //STEP 2) save the doc:
  await doc!.save({ validateBeforeSave: false, session }); // Mongoose internally manages sessions for save() calls, because of that, it conflicts with the session inside setRanking. so I'll create one session inside the controller and pass it to both services
}