import { categoriesInCache } from "@controllers/auth/categoryController";
import Product from "@models/productModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneProduct(productId: MongoId) {
  const safeGetProduct = safeThrowable(
    () => getOneDocById(Product, productId),
    (error) => new Failure((error as Error).message)
  );

  const getProductResult = await extractSafeThrowableResult(() => safeGetProduct);
  if (!getProductResult.ok) return getProductResult;

  const cats = await categoriesInCache(productId);

  const {result: product} = getProductResult;

  product.categories = cats;

  return {...getProductResult, result: product};
}

export default getOneProduct;
