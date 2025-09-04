import Product from "@models/productModel";
import { createDoc } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { ProductDataBody } from "@Types/Product";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import updateCategoryRelatedToProduct from "../categoryServices/updateCategoryRelatedToProduct";
import { Failure } from "@Types/ResultTypes/errors/Failure";

async function createNewProduct(storeId: MongoId, newProductData: ProductDataBody) {
  const data = { store: storeId, ...newProductData };
  const { categories } = newProductData;

  const safeCreateProduct = safeThrowable(
    () => createDoc(Product, data),
    (error) => new Failure((error as Error).message)
  );

  const newProductResult = await extractSafeThrowableResult(() => safeCreateProduct);

  if (newProductResult.ok && categories) await updateCategoryRelatedToProduct(categories, newProductResult.result.id);

  return newProductResult;
}

export default createNewProduct;
