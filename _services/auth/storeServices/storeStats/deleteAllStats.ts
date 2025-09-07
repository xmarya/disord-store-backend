import { deleteStoreStats } from "@repositories/store/storeStatsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";


async function deleAllStats(storeId:MongoId, session:mongoose.ClientSession) {
      const safeDeleteAllStats = safeThrowable(
    () => deleteStoreStats(storeId, session),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(() => safeDeleteAllStats);
}

export default deleAllStats;