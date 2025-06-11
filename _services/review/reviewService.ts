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

export async function calculateRatingsAverage(Model: Extract<Model, "Store" | "Product">, resourceId: MongoId, session: mongoose.ClientSession) {
  console.log("inside updateModelRating", Model);

  /* OLD CODE (kept for reference):  
    const collection = resourceName.concat(`s-${modelId}`);
    const doc = await mongoose.connection.collection(collection).findOne({_id: new mongoose.Types.ObjectId(modelId)}) as ProductDocument; // this is what I want, it asks the db directly about the existing collections
  */

  const stats = await Review.aggregate([
    {
      $match: { reviewedResourceId: resourceId },
    },
    {
      $group: {
        _id: "$reviewedResourceId",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

  // STEP 2) update the resource ratingsAverage and ratingsQuantity: (whether an update or delete)
  const doc = await mongoose.model(Model).findById(resourceId);

  if (stats.length > 0) {
    // if there are review docs for the resource
    doc!.ratingsAverage = stats[0].ratingsAverage;
    doc!.ratingsQuantity = stats[0].ratingsQuantity;
  } else {
    // if there are no review docs for the resource -all were deleted- then reset to 0
    doc.ratingsQuantity = 0;
    doc.ratingsAverage = 0;
  }

  //STEP 2) save the doc:
  await doc.save({ validateBeforeSave: false, session }); // Mongoose internally manages sessions for save() calls, because of that, it conflicts with the session inside setRanking. so I'll create one session inside the controller and pass it to both services
}
