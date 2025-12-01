import novu from "@config/novu";
import { StoreSuspendedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuSuspendStoreEmail(event: StoreSuspendedEvent) {
  const {
    store: { storeName, owner },
  } = event.payload;

  const workflowId = "suspend-store-by-admin";
  const safeTrigger = safeThrowable(
    () =>
      novu.trigger({
        workflowId,
        to: owner.toString(),
        payload: { storeName },
      }),
    (error) => new Failure((error as Error).message)
  );

  const triggerResult = await extractSafeThrowableResult(() => safeTrigger);

  if (!triggerResult.ok) return new Failure(triggerResult.message, { serviceName: "novu", ack: false });

  return new Success({ serviceName: "novu", ack: true });
}

export default novuSuspendStoreEmail;
