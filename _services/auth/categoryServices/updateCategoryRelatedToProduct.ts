import eventBus from "@config/EventBus";
import { FailedOperationDto$inboundSchema } from "@novu/api/models/components";
import { updateProductInCategories } from "@repositories/category/categoryRepo";
import { ProductUpdatedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateCategoryRelatedToProduct(categories: Array<MongoId>, productId: MongoId) {
  const safeUpdateCategory = safeThrowable(
    () => updateProductInCategories(categories, productId),
    (error) => new Failure((error as Error).message)
  );

  const updateCategoryResult = await extractSafeThrowableResult(() => safeUpdateCategory);
  if(!updateCategoryResult.ok) return new Failure(updateCategoryResult.message);

  const event: ProductUpdatedEvent = {
    type: "product-updated",
    payload: {
      categories,
      productId,
    },
  };

  eventBus.publish(event);
  return updateCategoryResult;
}

export default updateCategoryRelatedToProduct;
