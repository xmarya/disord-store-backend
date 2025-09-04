import eventBus from "@config/EventBus";
import { deleteFromCache } from "@externals/redis/cacheControllers/globalCache";
import { deleteProductFromCategory } from "@repositories/category/categoryRepo";
import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";

// remove the id of deleted product from reviews
eventBus.ofType<ProductDeletedEvent>("product.deleted").subscribe(async (event) => {
  const { productId } = event.payload;

  await deleteAllResourceReviews(productId);
});

// remove the id of deleted product from categories
eventBus.ofType<ProductDeletedEvent>("product.deleted").subscribe(async (event) => {
  const { productId, categories } = event.payload;

  await deleteProductFromCategory(categories, productId);
});

// remove the cached data if exist
eventBus.ofType<ProductDeletedEvent>("product.deleted").subscribe(async (event) => {
  const { productId } = event.payload;

  safeThrowable(
    () => deleteFromCache(`Product:${productId}`),
    (error) => new Failure((error as Error).message)
  );
});
