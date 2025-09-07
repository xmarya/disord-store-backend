import eventBus from "@config/EventBus";
import Product from "@models/productModel";
import { deleteDoc } from "@repositories/global";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteProductAndItsRelated(productId: MongoId) {
  const safeDeleteProduct = safeThrowable(
    () => deleteDoc(Product, productId),
    (error) => new Failure((error as Error).message)
  );
  const deleteProductResult = await extractSafeThrowableResult(() => safeDeleteProduct);

  if (!deleteProductResult.ok) return deleteProductResult;

  const { result: deletedProduct } = deleteProductResult;
  const event: ProductDeletedEvent = {
    type: "product.deleted",
    payload: {
      productId: deletedProduct.id,
      categories: deletedProduct.categories as MongoId[],
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return deleteProductResult;
}

export default deleteProductAndItsRelated;
