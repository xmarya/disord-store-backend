import mongoose from "mongoose";
import { Model } from "../../_Types/Model";
import { ProductDocument } from "../../_Types/Product";
import { StoreDocument } from "../../_Types/Store";

export async function setRanking(Model: Extract<Model, "Store" | "Product">, session: mongoose.ClientSession) {
  const sortedDocs = await mongoose.model(Model).aggregate(
    [
      {
        $match: {
          ratingsQuantity: { $gt: 0 },
          ratingsAverage: { $ne: null },
        },
      },
      { $sort: { ratingsAverage: -1, ratingsQuantity: 1 } }, // If ratingsAverage is the same, sort by ratingsQuantity in ascending order
    ],
    { session }
  ); // Without that, the aggregation could run outside the transaction, especially if it's reading stale data before the rating update is committed

  /* OLD CODE (kept for reference): 
  const rankingBulkOps: mongoose.AnyBulkWriteOperation<RankingDocument>[] = [];
  // STEP 3) insert the new sorted documents inside the Ranking Model:
  sortedDocs.map((doc, index) => {
    rankingBulkOps.push({
      updateOne: {
        filter: { resourceId: doc._id },
        update: { $set: { rank: index + 1, resource: Model } },
        upsert: true,
      },
    });
  });
  
  await Ranking.bulkWrite(rankingBulkOps, { session });
  */

  const resourceBulkOps: mongoose.AnyBulkWriteOperation<StoreDocument | ProductDocument>[] = [];
  sortedDocs.map((doc, index) => {
    resourceBulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { ranking: index + 1 },
      },
    });
  });

  //STEP 4) re-rank the actual Model documents:
  await mongoose.model(Model).bulkWrite(resourceBulkOps, { session });
}
