import { updateProduct } from "@repositories/product/productRepo";
import { MongoId } from "@Types/Schema/MongoId";
import { DigitalProduct, PhysicalProduct } from "@Types/Schema/Product";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import updateCategoryRelatedToProduct from "../categoryServices/updateCategoryRelatedToProduct";
import { Failure } from "@Types/ResultTypes/errors/Failure";

async function updateOneProduct(storeId: MongoId, productId: MongoId, updatedData: Partial<Omit<DigitalProduct, "store"> | Omit<PhysicalProduct, "store">>) {
  const safeUpdateProduct = safeThrowable(
    () => updateProduct(storeId, productId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  const updateProductResult = await extractSafeThrowableResult(() => safeUpdateProduct);
  if (!updateProductResult.ok) return updateProductResult;

  if (updatedData?.categories) await updateCategoryRelatedToProduct(updatedData.categories as MongoId[], updateProductResult.result.id);

  return updateProductResult;
}

export default updateOneProduct;
