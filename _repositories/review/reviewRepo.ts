import mongoose from "mongoose";
import { Model } from "@Types/Model";
import { MongoId } from "@Types/MongoId";
import Review from "@models/reviewModel";

export async function confirmReviewAuthorisation(reviewId: string, userId: string): Promise<boolean> {
  const authorised = await Review.exists({ _id: reviewId, writer: userId });

  return !!authorised;
}

export async function calculateRatingsAverage(Model: Extract<Model, "Store" | "Product">, resourceId: MongoId, session: mongoose.ClientSession) {
  /* OLD CODE (kept for reference):  
    const collection = resourceName.concat(`s-${modelId}`);
    const doc = await mongoose.connection.collection(collection).findOne({_id: new mongoose.Types.ObjectId(modelId)}) as ProductDocument; // this is what I want, it asks the db directly about the existing collections
  */

  const stats = await Review.aggregate([
    {
      $match: { reviewedResourceId: new mongoose.Types.ObjectId(resourceId) },
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
  const doc = await mongoose.model(Model).findById(resourceId).select("ratingsAverage ratingsQuantity ranking");

  if (stats.length > 0) {
    // if there are review docs for the resource
    doc!.ratingsAverage = stats[0].ratingsAverage;
    doc!.ratingsQuantity = stats[0].ratingsQuantity;
  } else {
    // if there are no review docs for the resource -all were deleted- then reset to 0
    doc.ratingsQuantity = 0;
    doc.ratingsAverage = 0;
    doc.ranking = null;
  }

  //STEP 2) save the doc:
  await doc.save({ validateBeforeSave: false, session }); // Mongoose internally manages sessions for save() calls, because of that, it conflicts with the session inside setRanking. so I'll create one session inside the controller and pass it to both services
}

export async function deleteAllResourceReviews(resourceId: MongoId, session: mongoose.ClientSession) {
  await Review.deleteMany({ reviewedResourceId: resourceId }).session(session);
}
