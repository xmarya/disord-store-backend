import eventBus from "@config/EventBus";
import { setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { QueryResultsFetchedEvent } from "@Types/events/QueryResultsFetchedEvent";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<QueryResultsFetchedEvent>("queryResults-fetched").subscribe((event) => {
  const { key, queryResults } = event.payload;

  safeThrowable(
    () => setCompressedCacheData(key, queryResults, "fifteen-minutes"),
    (error) => new Error((error as Error).message)
  );
});
