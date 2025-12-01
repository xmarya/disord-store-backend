import novu from "@config/novu";
import Store from "@models/storeModel";
import { getOneDocById } from "@repositories/global";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuDeleteStoreEmail(event: StoreDeletedEvent) {
  const { creator, storeId } = event.payload;
  const safeGetStore = safeThrowable(
    () => getOneDocById(Store, storeId, { select: ["storeName", "owner"] }),
    (error) => new Failure((error as Error).message)
  );
  const storeResult = await extractSafeThrowableResult(() => safeGetStore);
  if (!storeResult.ok) return new Failure(storeResult.message, { serviceName: "novu", ack: false });

  const owner = storeResult.result.owner.toString();
  const storeName = storeResult.result.storeName;
  const workflowId = creator === "admin" ? "store-deletion-by-admin" : "store-deletion-by-store-owner";

  const safeTrigger = safeThrowable(
    () => novu.trigger({ workflowId, to: owner, payload: { storeName } }),
    (error) => new Failure((error as Error).message)
  );

  const triggerResult = await extractSafeThrowableResult(() => safeTrigger);

  if (!triggerResult.ok) return new Failure(triggerResult.message, { serviceName: "novu", ack: false });

  return new Success({ serviceName: "novu", ack: true });
}

export default novuDeleteStoreEmail;
