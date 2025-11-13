import { updateStoreStats as updateStats } from "@repositories/store/storeStatsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { InvoiceDataBody } from "@Types/Schema/Invoice";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

type StatsPerStore = Array<{
  storeId: MongoId;
  profit: number;
  products: Array<{ productId: MongoId; quantity: number }>;
}>;
async function updateStoreStats(data: Pick<InvoiceDataBody, "productsPerStore">, operationType: "new-purchase" | "cancellation") {
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
        // the reason why I didn't update the stores' stats using bulkWrite is because it would be harder to correctly shape the data and find any bugs/errors that might happen through the multiple processes the data goes through
      await updateStats(storeId, profit, products, operationType, session);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    return new Failure();
  } finally {
    await session.endSession();
  }
}

export default updateStoreStats;
