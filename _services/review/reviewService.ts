import mongoose from "mongoose";
import Review from "../../models/reviewModel";
import { MongoId } from "../../_Types/MongoId";
import { Model } from "../../_Types/Model";
import { ProductDocument } from "../../_Types/Product";
import { StoreDocument } from "../../_Types/Store";


export async function confirmReviewAuthorisation(reviewId: string, userId: string): Promise<boolean> {
  console.log("confirmReviewAuthorisation", reviewId);
  const authorised = await Review.exists({ _id: reviewId, writer: userId });

  return !!authorised;
}

export async function calculateRatingsAverage(Model:Extract<Model, "Store" | "Product">, docId: MongoId, rating:number, isDelete: boolean = false, session:mongoose.ClientSession) {
  console.log("inside updateModelRating", Model);

  const quantity = isDelete ? -1 : 1;
  const average = isDelete ? -rating : rating;

  const doc = await mongoose.model(Model).findById(docId) as ProductDocument | StoreDocument;

  /* OLD CODE (kept for reference):  
    const collection = resourceName.concat(`s-${modelId}`);
    const doc = await mongoose.connection.collection(collection).findOne({_id: new mongoose.Types.ObjectId(modelId)}) as ProductDocument; // this is what I want, it asks the db directly about the existing collections
  */
   
    const stats = await mongoose.model(Model).aggregate([
    {
      $match: {resourceId: docId}
    },
    {
      $group: {
        _id: null,
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      }
    }
  ]);

  // STEP 2) update the resource ratingsAverage and ratingsQuantity: (whether an update or delete)
  doc!.ratingsAverage = stats[0].ratingsAverage;
  doc!.ratingsQuantity = stats[0].ratingsQuantity;

  //STEP 2) save the doc:
  await doc!.save({ validateBeforeSave: false, session }); // Mongoose internally manages sessions for save() calls, because of that, it conflicts with the session inside setRanking. so I'll create one session inside the controller and pass it to both services
}