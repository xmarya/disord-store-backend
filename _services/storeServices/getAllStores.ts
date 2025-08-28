import eventBus from "@config/EventBus";
import Store from "@models/storeModel";
import { getAllDocs } from "@repositories/global";
import { StoreListFetched } from "@Types/events/StoreEvents";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllStores(query: QueryParams) {
  const safeGetStores = safeThrowable(
    () => getAllDocs(Store, query, { select: ["storeName", "logo", "description", "ranking", "ratingsAverage", "ratingsQuantity", "verified"] }),
    (error) => new Error((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => safeGetStores);

  if(result.ok) {
    const event:StoreListFetched = {
        type: "storeList-fetched",
        payload: {query: JSON.stringify(query), storesList:result.result},
        occurredAt: new Date()
    }

    eventBus.publish(event);
  }

return result
}

export default getAllStores;
