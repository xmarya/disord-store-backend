import Product from "@models/productModel";
import { getAllDocs } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllProductsForAuthorisedUser(storeId: MongoId, query: QueryParams) {
  const safeGetProducts = safeThrowable(
    () => getAllDocs(Product, query, {condition: {store: storeId}}),
    (error) => new Error((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => safeGetProducts);

  return result;
}

export default getAllProductsForAuthorisedUser;
