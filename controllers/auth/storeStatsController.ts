/*
    1- accept the invoice data
    2- handle it per store
    3- check the redis if the hash of profits:storeId exists
        yes? get the hash, increment/decrement the value, return it to the user
        no? create a new hash
    **after storeowner login, get the store profits, cache
*/

import { startSession } from "mongoose";
import { getOneStoreStats, updateStoreStats } from "../../_repositories/store/storeStatsRepo";
import { InvoiceDataBody } from "../../_Types/Invoice";
import { MongoId } from "../../_Types/MongoId";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";

type StatsPerStore = Array<{
  storeId: MongoId;
  profit: number;
  products: Array<{ productId: MongoId; quantity: number }>;
}>;
export async function updateStoreStatsController(data: Pick<InvoiceDataBody, "productsPerStore">, operationType: "new-purchase" | "cancellation") {
  const { productsPerStore } = data;
  const statsPerStore: StatsPerStore = productsPerStore.map(({ storeId, products }) => ({
    storeId,
    products: products.map(({ productId, quantity }) => ({ productId, quantity })),
    profit: products.reduce((sum, { productTotal }) => sum + productTotal, 0),
  }));

  const session = await startSession();
  try {
    session.startTransaction();
    for (const { storeId, products, profit } of statsPerStore) {
      await updateStoreStats(storeId, profit, products, operationType, session);
    }
    // await listenToStream(); // should be outside the loop
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    return new AppError(500, "something went wrong, please try again");
  } finally {
    await session.endSession();
  }
}

export const getStoreStatsController = catchAsync(async (request, response, next) => {
  /* BUG: 
  const { dates } = request.body;
    this condition WOULD NEVER be wrong, the .length property doesn't assure that the dates is an ARRAY,
    there is a possibility for it be a string and it has .length property too.
    if(!dates.length) return next(new AppError(400, "specify the dates inside an array"));
  */
  const { dateFilter, sortBy, sortOrder } = request.dateQuery;
  const storeId = request.store;
  const stats = await getOneStoreStats(storeId, dateFilter, sortBy, sortOrder);
  if (!stats) return next(new AppError(404, "no stats were found for this store"));

  response.status(200).json({
    success: true,
    stats,
  });

  /* the response => 
  {
    "success": true,
    "stats": [
        {
            "date": "2025-07-03T08:17:18.354Z",
            "totalSoldProducts": {
                "684ac4c648085d1348231248": 6,
                "684ac6ed0d7b4453cf566bc5": 12,
                "684ac76f9e4ba6351f4fa887": 12
            }
        }
    ]
}
  
  */
});
