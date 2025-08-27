import eventBus from "@config/EventBus";
import { setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { StoreListFetched } from "@Types/events/StoreEvents";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<StoreListFetched>("storeList-fetched").subscribe((event) => {
  const { query, storesList } = event.payload;

  safeThrowable(
    () => setCompressedCacheData(`Store:${query}`, storesList, "fifteen-minutes"),
    (error) => new Error((error as Error).message)
  );
});
