import mongoose from "mongoose";
import StoreStats from "../../models/storeStatModel";
import { endOfDay, startOfDay } from "date-fns";
import { MongoId } from "../../_Types/MongoId";
import { StoreStatsDocument } from "../../_Types/StoreStats";
import { PlansNames } from "../../_Types/Plan";

/*REQUIRES TESTING*/
export async function getAllStoresStats(
  sortBy: "totalProfits" | "createdAt" = "totalProfits",
  sortOrder: "desc" | "asc" = "desc",
  filter?: { plan: PlansNames; verified: boolean }
): Promise<mongoose.Aggregate<any[]> | null> {
  // NOTE: THIS IS FOR ADMIN

  const planMatchStage = filter?.plan ? { $match: { "storeDoc.inPlan": filter.plan } } : null;
  const verifiedMatchStage = filter?.verified ? { $match: { "storeDoc.verified": filter.verified } } : null;

  const allStats = await StoreStats.aggregate([
    {
      $lookup: {
        from: "stores",
        localField: "store",
        foreignField: "_id",
        as: "storeDoc",
      },
      /*
      The $lookup stage adds a new array field to each input document. 
      The new array field contains the matching documents from the foreign collection. 
      The $lookup stage passes these reshaped documents to the next stage.
      */
    },
    {
      $unwind: "$storeDoc", // deconstructs the array and generates multiple docs for each item of the array.
    },
    ...(planMatchStage ? [planMatchStage] : []),
    ...(verifiedMatchStage ? [verifiedMatchStage] : []),
    {
      $group: {
        _id: "$storeDoc._id", // after the $lookup and $unwind, the store's id and storeName now are accessible, which wasn't since the store must to populated first.
        storeName: { $first: "$storeDoc.storeName" },
        owner: { $first: "$storeDoc.owner" },
        logo: { $first: "$storeDoc.logo" },
        verified: { $first: "$storeDoc.verified" },
        plan: { $first: "$storeDoc.inPlan" },
        totalProfits: { $sum: "$profits" },
        createdAt: { $first: "$storeDoc.createdAt" },
      },
    },
    {
      $project: {
        _id: 1,
        storeName: 1,
        owner: 1,
        logo: 1,
        verified: 1,
        plan: 1,
        totalProfits: 1,
        createdAt: 1,
      },
    },
    { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
  ]);

  return allStats; // return the profits OAT only => [{storeName: "1", totalProfit: 123}, {storeName: "2", totalProfit: 123}]
}
/*REQUIRES TESTING*/
export async function getOneStoreStats(storeId: MongoId, dateFilter: { date: { $gte: Date; $lte: Date } }, sortBy: "date" | "profits" | "soldProducts" = "date", sortOrder: "desc" | "asc" = "desc") {
  // NOTE: THIS IS FOR STORE OWNER
  const stats = await StoreStats.aggregate([
    {
      $match: { store: new mongoose.Types.ObjectId(storeId), ...dateFilter }, // select only the docs with this storeId and Time period (week, month, year)
    },
    {
      $group: {
        // group them by the date AND accumulate the profits and the soleProducts
        _id: "$date",
        totalProfits: { $sum: "$profits" },
        soldProductMap: { $push: "$soldProducts" }, // accumulate the Map values by pushing it as a whole. (NOTE that it's not "$soldProducts.quantity", no such a property like this. the soldProducts field is now a Map)
      },

      /* NOTE:
            BEFORE $group:
            [
               { soldProducts: { "prod1": 2, "prod7": 4 } },
               { soldProducts: { "prod1": 1, "prod3": 5 } },
               { soldProducts: { "prod2": 2 } }
            ]

            AFTER $group:
            {
               _id: "2025-05-27",
               soldProductsMaps: [
                  { "prod1": 2, "prod7": 4 },
                  { "prod1": 1, "prod3": 5 },
                  { "prod2": 2 }
               ]
            }
         */
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalProfits: 1,
        soldProductMap: 1,
      },
    },
    { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
  ]);

  const formattedStats: Array<{ date: Date; totalSoldProducts: Record<string/*productId*/, number/*quantity*/> }> = stats.map((item) => {
    const totalForEachProduct: Record<string, number> = {};

    item.soldProductMap.forEach((soldMap: Map<string, number>) => {
      if (!soldMap) return; // in case the original stats was null | undefined, or in case the productsMap was containing such a falsy values (protecting against invalid or missing data).

      Object.entries(soldMap).forEach(([productId, quantity]) => {
        if (!totalForEachProduct[productId]) totalForEachProduct[productId] = 0; // if the product doesn't exist, initialise it with 0.
        totalForEachProduct[productId] += quantity; // accumulate the quantity.
      });
    });

    return {
      date: item.date,
      totalSoldProducts: totalForEachProduct,
    };
  });

  return formattedStats;
}

// TODO: call it after a successful payment/cancellation (using loop, at the end of the invoice, no await)
export async function updateStoreStats(
  storeId: MongoId,
  profit: number,
  products: Array<{ productId: MongoId; quantity: number }>,
  operationType: "new-purchase" | "cancellation",
  session: mongoose.ClientSession
) {
  console.log("updateStoreStats");
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const isIncrement = operationType === "new-purchase";
  const profits = isIncrement ? profit : -profit;
  const purchase = isIncrement ? 1 : 0;
  const cancellation = isIncrement ? 0 : 1;

  let soldProductsUpdate: mongoose.UpdateQuery<StoreStatsDocument> = {};

  for (const { productId, quantity } of products) {
    const key = `soldProducts.${productId}`;
    soldProductsUpdate.$inc ??= {};
    soldProductsUpdate.$inc[key] = isIncrement ? quantity : -quantity;
  }

  const updatedStats = await StoreStats.findOneAndUpdate(
    { store: storeId, date: { $gte: dayStart, $lte: dayEnd } },
    {
      soldProductsUpdate,
      //Or ...soldProductsUpdate, ?
      $inc: {
        profits,
        numOfPurchases: purchase,
        numOfCancellations: cancellation,
      },
      $setOnInsert: {
        store: storeId,
        date: now,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).session(session);

  // clean up any quantity with 0 or minus value:
  let cleanedStats;
  if (!isIncrement && updatedStats) {
    const soldProductCleanUp: any = {};

    for (const [productId, quantity] of updatedStats.soldProducts.entries()) {
      if (quantity <= 0) soldProductCleanUp[`soldProducts.${productId}`] = "";
    }

    if (Object.keys(soldProductCleanUp).length > 0) {
      cleanedStats = await StoreStats.findByIdAndUpdate(updatedStats._id, { $unset: soldProductCleanUp }, { session });
    }
  }

  // return updatedStats;
  return cleanedStats ?? updatedStats;
}