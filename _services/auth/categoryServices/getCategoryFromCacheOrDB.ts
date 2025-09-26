import { getDecompressedCacheData, setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { getAllProductCategories } from "@repositories/category/categoryRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { CategoryBasic } from "@Types/Schema/Category";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getCategoryFromCacheOrDB(productId: MongoId) {

  const safeGetCachedCategory = safeThrowable(
    () => getDecompressedCacheData<CategoryBasic[]>(`Category:${productId.toString()}`),
    (error) => new Failure((error as Error).message)
  );

  const cachedCategoryResult = await extractSafeThrowableResult(() => safeGetCachedCategory);
  if (cachedCategoryResult.ok) return cachedCategoryResult;

  const safeGetDBCategory = safeThrowable(
    () => getAllProductCategories(productId),
    (error) => new Failure((error as Error).message)
  );
  const dbCategoryResult = await extractSafeThrowableResult(() => safeGetDBCategory);

  if(dbCategoryResult.ok) {
    const {result:categories} = dbCategoryResult
    await setCompressedCacheData(`Category:${productId}`, categories, "fifteen-minutes");
  }

  return dbCategoryResult;
}

export default getCategoryFromCacheOrDB;
