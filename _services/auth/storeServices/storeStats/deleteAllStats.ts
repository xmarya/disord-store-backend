import { deleteStoreStats } from "@repositories/store/storeStatsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

// TODO this should be run under conditions after the full integration with the payment gateway
// so the owner's unwithdrawn profits wouldn't be deleted
async function deleteAllStats(storeId:MongoId, session:mongoose.ClientSession) {
      const safeDeleteAllStats = safeThrowable(
    () => deleteStoreStats(storeId),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(() => safeDeleteAllStats);
}

export default deleteAllStats;