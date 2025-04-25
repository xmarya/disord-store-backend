import mongoose from "mongoose";
import { getDynamicModel } from "../../_utils/dynamicMongoModel";
import { ProductDocument } from "../../_Types/Product";
import { RankingDocument } from "../../_Types/Ranking";

export async function setRanking<T extends ProductDocument>(Model: mongoose.Model<T>, storeId: string, session:mongoose.ClientSession) {
  // Model is Product-${storeId} || Store
  console.log("inside setRanking");
  const sortedDocs: Array<T> = await Model.aggregate([
    {
      $match: {
        ratingsQuantity: { $gt: 0 },
        ratingsAverage: { $ne: null },
      },
    },
    { $sort: { ratingsAverage: -1, ratingsQuantity: 1 } }, // If ratingsAverage is the same, sort by ratingsQuantity in ascending order
  ]).session(session); // Without that, the aggregation could run outside the transaction, especially if it's reading stale data before the rating update is committed

  // Ranking-product-${storeId} || RankingStores -future feature-
  const Ranking: mongoose.Model<RankingDocument> = await getDynamicModel<RankingDocument>("Ranking-product", storeId);
    // STEP 3) insert the new sorted documents inside the Ranking Model:
    await Promise.all(
      sortedDocs.map(async (doc, index) => {
        console.log("doc.Id", doc._id);
        Ranking.findOneAndUpdate({ modelId: doc._id }, { $set: { rank: index + 1 } }, { upsert: true, session });
      })
    );

    //STEP 4) re-rank the actual Model documents:
    await Promise.all(
      sortedDocs.map(async (doc, index) => {
        Model.findByIdAndUpdate(doc._id, { ranking: index + 1 }, { session });
      })
    );
}
