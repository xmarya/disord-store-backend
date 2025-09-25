import Product from "@models/productModel";
import { getOneDocById } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import getCategoryFromCacheOrDB from "../categoryServices/getCategoryFromCacheOrDB";
import { CategoryBasic} from "@Types/Schema/Category";
import { Success } from "@Types/ResultTypes/Success";

async function getOneProduct(productId: MongoId) {
  const safeGetProduct = safeThrowable(
    () => getOneDocById(Product, productId),
    (error) => new Failure((error as Error).message)
  );

  const getProductResult = await extractSafeThrowableResult(() => safeGetProduct);
  if (!getProductResult.ok) return getProductResult;

  const catsResult = await getCategoryFromCacheOrDB(productId);
  if (!catsResult.ok && catsResult.reason === "error") return new Failure(catsResult.message);
  const { result: product } = getProductResult;
  const { result: categories } = catsResult as {result: Array<CategoryBasic>};

  product.categories = categories ?? [];

  return new Success(product);
}

export default getOneProduct;
