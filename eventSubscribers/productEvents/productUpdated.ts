import eventBus from "@config/EventBus";
import { setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { ProductUpdatedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<ProductUpdatedEvent>("product.updated").subscribe((event) => {
  const { categories, productId } = event.payload;

  safeThrowable(
    () => setCompressedCacheData(`Category:${productId}`, categories, "fifteen-minutes"),
    (error) => new Failure((error as Error).message)
  );
});
