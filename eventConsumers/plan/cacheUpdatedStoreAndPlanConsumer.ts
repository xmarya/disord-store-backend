import cacheStoreAndPlan from "@externals/redis/cacheControllers/storeAndPlan";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function cacheStoreAndPlanConsumer(event: PlanSubscriptionUpdatedEvent) {
  const { subscriptionType, planId, planName, planExpiryDate, storeOwner } = event.payload;
  const hasStore = !storeOwner?.myStore
  const isUnlimitedPlan = planName === "unlimited";
  const isRenewal = subscriptionType === "renewal";
  if (hasStore || isRenewal || isUnlimitedPlan) return new Success({ serviceName: "redisStoreAndPlan", ack: true });

  const isPaid = subscriptionType === "cancellation" ? false : true;

  const safeUpdateCache = safeThrowable(
    () => cacheStoreAndPlan({ store: storeOwner.myStore, plan: planId, isPaid, planExpiryDate }),
    (error) => new Failure((error as Error).message, { serviceName: "redisStoreAndPlan", ack: false })
  );

  const updateResult = await extractSafeThrowableResult(() => safeUpdateCache);
  if (!updateResult.ok) return new Failure(updateResult.message, { serviceName: "redisStoreAndPlan", ack: false });

  return new Success({ serviceName: "redisStoreAndPlan", ack: true });
}

export default cacheStoreAndPlanConsumer;
