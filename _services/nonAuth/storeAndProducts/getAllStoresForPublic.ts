import eventBus from "@config/EventBus";
import Store from "@models/storeModel";
import { getAllDocs } from "@repositories/global";
import { QueryResultsFetchedEvent } from "@Types/events/QueryResultsFetchedEvent";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllStoresForPublic(query: QueryParams) {
  const safeGetStores = safeThrowable(
    () => getAllDocs(Store, query, { select: ["storeName", "logo", "description", "ranking", "ratingsAverage", "ratingsQuantity", "verified"] }),
    (error) => new Error((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => safeGetStores);

  if (result.ok) {
    const event: QueryResultsFetchedEvent = {
      type: "queryResults-fetched",
      payload: { key: `Stores:${JSON.stringify(query)}`, queryResults: result.result },
      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }

  return result;
}

export default getAllStoresForPublic;
