import { deleteAllCategories } from "@repositories/category/categoryRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllStoreCategories(storeId: MongoId, session:mongoose.ClientSession) {
  const safeDeleteAllCategories = safeThrowable(
    () => deleteAllCategories(storeId, session),
    (error) => new Failure((error as Error).message)
  );

  return extractSafeThrowableResult(() => safeDeleteAllCategories);
}

export default deleteAllStoreCategories;
