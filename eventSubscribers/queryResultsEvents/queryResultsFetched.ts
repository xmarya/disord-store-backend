import eventBus from "@config/EventBus";
import { setCompressedCacheData } from "@externals/redis/cacheControllers/globalCache";
import { QueryResultsFetched } from "@Types/events/QueryResultsFetched";
import safeThrowable from "@utils/safeThrowable";

eventBus.ofType<QueryResultsFetched>("queryResults-fetched").subscribe((event) => {
  const { key, queryResults } = event.payload;

  safeThrowable(
    () => setCompressedCacheData(key, queryResults, "fifteen-minutes"),
    (error) => new Error((error as Error).message)
  );
});
