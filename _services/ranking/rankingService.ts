import mongoose from "mongoose";
import { Model } from "../../_Types/Model";
import Ranking from "../../models/rankingModel";
import { MongoId } from "../../_Types/MongoId";
import { RankingDocument } from "../../_Types/Ranking";
import { StoreDocument } from "../../_Types/Store";
import { ProductDocument } from "../../_Types/Product";

export async function setRanking(Model: Extract<Model, "Store" | "Product">, session: mongoose.ClientSession) {
  // Model is Product-${storeId} || Store
  console.log("inside setRanking");
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
  // Ranking.findOneAndUpdate({ resourceId: doc._id }, { $set: { rank: index + 1, resource: Model } }, { new: true, upsert: true, session });

  const resourceBulkOps:mongoose.AnyBulkWriteOperation<StoreDocument | ProductDocument>[] = [];
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

export async function removeRanking(resourceId: MongoId, session: mongoose.ClientSession) {
  const deletedResource = await Ranking.findOneAndDelete({ resourceId }).session(session);
  if (!deletedResource) return;
  setRanking(deletedResource.resource, session); // run it without blocking the main thread
}
