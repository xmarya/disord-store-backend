import mongoose from "mongoose";
import { Model } from "../../_Types/Model";
import Ranking from "../../models/rankingModel";
import { MongoId } from "../../_Types/MongoId";

export async function setRanking(Model: Extract<Model, "Store" | "Product">, session: mongoose.ClientSession) {
  // Model is Product-${storeId} || Store
  console.log("inside setRanking");
  const sortedDocs = await mongoose
    .model(Model)
    .aggregate([
      {
        $match: {
          ratingsQuantity: { $gt: 0 },
          ratingsAverage: { $ne: null },
        },
      },
      { $sort: { ratingsAverage: -1, ratingsQuantity: 1 } }, // If ratingsAverage is the same, sort by ratingsQuantity in ascending order
    ])
    .session(session); // Without that, the aggregation could run outside the transaction, especially if it's reading stale data before the rating update is committed

  // STEP 3) insert the new sorted documents inside the Ranking Model:
  await Promise.all(
    sortedDocs.map(async (doc, index) => {
      console.log("doc.Id", doc._id);
      Ranking.findOneAndUpdate({ resourceId: doc._id }, { $set: { rank: index + 1 } }, { upsert: true, session });
    })
  );

  //STEP 4) re-rank the actual Model documents:
  await Promise.all(
    sortedDocs.map(async (doc, index) => {
      mongoose.model(Model).findByIdAndUpdate(doc._id, { ranking: index + 1 }, { session });
    })
  );
}

export async function removeRanking(resourceId:MongoId, session: mongoose.ClientSession) {
  const deletedResource = await Ranking.findOneAndDelete({resourceId}).session(session);
  if(!deletedResource) return;
  setRanking(deletedResource.resource, session); // run it without blocking the main thread
}
