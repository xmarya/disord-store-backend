import Category from "@models/categoryModel";
import { getAllDocs } from "@repositories/global";
import { QueryParams } from "@Types/helperTypes/Request";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllCategories(storeId: MongoId, query: QueryParams) {
  const safeGet = safeThrowable(
    () => getAllDocs(Category, query, { condition: { store: storeId } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGet);
}

export default getAllCategories;
