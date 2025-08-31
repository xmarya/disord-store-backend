import eventBus from "@config/EventBus";
import { setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { CategoryUpdateEvent } from "@Types/events/CategoryEvents";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<CategoryUpdateEvent>("category.updated").subscribe((event) => {
  const { categories, productId } = event.payload;

  safeThrowable(
    () => setCompressedCacheData(`Category:${productId}`, categories, "fifteen-minutes"),
    (error) => new Error((error as Error).message)
  );
});
