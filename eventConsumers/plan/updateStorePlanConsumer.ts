import { updateStoreInPlan } from "@repositories/store/storeRepo";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateStorePlanConsumer(event: PlanSubscriptionUpdatedEvent) {
  const { storeOwner, planName, subscriptionType } = event.payload;
  if (subscriptionType === "renewal" || planName === "unlimited") return new Success({ serviceName: "storesCollection", ack: true });

  const safeUpdateStore = safeThrowable(
    () => updateStoreInPlan(storeOwner._id as string, planName),
    (error) => new Failure((error as Error).message)
  );

  const updatedStoreResult = await extractSafeThrowableResult(() => safeUpdateStore);
  if (!updatedStoreResult.ok) return new Failure(updatedStoreResult.message, { serviceName: "storesCollection", ack: false });

  return new Success({ serviceName: "storesCollection", ack: true });
}

export default updateStorePlanConsumer;
