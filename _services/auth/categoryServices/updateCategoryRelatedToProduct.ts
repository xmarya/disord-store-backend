import eventBus from "@config/EventBus";
import { updateProductInCategories } from "@repositories/category/categoryRepo";
import { ProductUpdatedEvent } from "@Types/events/ProductEvents";
import { MongoId } from "@Types/MongoId";

async function updateCategoryRelatedToProduct(categories: Array<MongoId>, productId: MongoId) {
  await updateProductInCategories(categories, productId);
  const event: ProductUpdatedEvent = {
    type: "product.updated",
    payload: {
      categories,
      productId,
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);
}

export default updateCategoryRelatedToProduct;
