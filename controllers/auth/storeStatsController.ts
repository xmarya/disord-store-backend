/*
    1- accept the invoice data
    2- handle it per store
    3- check the redis if the hash of profits:storeId exists
        yes? get the hash, increment/decrement the value, return it to the user
        no? create a new hash
    4-

    **after storeowner login, get the store profits, cache
*/

import { startSession } from "mongoose";
import { updateStoreStats } from "../../_services/store/storeStatsService";
import { InvoiceDataBody } from "../../_Types/Invoice";
import { MongoId } from "../../_Types/MongoId";

type StatsPerStore = Array<{
  storeId: MongoId;
  profit: number;
  products: Array<{ productId: MongoId; quantity: number }>;
}>;
export async function updateStoreStatsController(data: Pick<InvoiceDataBody, "productsPerStore">, operationType: "new-purchase" | "cancellation") {
  console.log("updateStoreStatsController");
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

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
}
