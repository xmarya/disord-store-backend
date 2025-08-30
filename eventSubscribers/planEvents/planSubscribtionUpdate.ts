import eventBus from "@config/EventBus";
import cacheUser from "@externals/redis/cacheControllers/user";
import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { updatePlanMonthlyStats } from "@repositories/plan/planRepo";
import { updateStoreInPlan } from "@repositories/store/storeRepo";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";
import safeThrowable from "@utils/safeThrowable";

// update the plans stats:
eventBus.ofType<PlanSubscriptionUpdateEvent>("planSubscription.updated").subscribe((event) => {
  const { planName, profit, subscriptionType } = event.payload;
  safeThrowable(
    () => updatePlanMonthlyStats(planName, profit, subscriptionType),
    //TODO: () => addFailedJob("key", event.payload)
    (error) => new Error((error as Error).message)
  );
});

// update the store inPlan field:
eventBus.ofType<PlanSubscriptionUpdateEvent>("planSubscription.updated").subscribe((event) => {
  const { storeOwner, planName, subscriptionType } = event.payload;
  if (subscriptionType === "renewal" || planName === "unlimited") return;

  safeThrowable(
    () => updateStoreInPlan(storeOwner.id, planName),
    //TODO: () => addFailedJob("key", event.payload)
    (error) => new Error((error as Error).message)
  );
});

// link the unlimited store owner id to the unlimited plan
eventBus.ofType<PlanSubscriptionUpdateEvent>("planSubscription.updated").subscribe((event) => {
  const { storeOwner, planId, planName } = event.payload;

  if (planName !== "unlimited") return;
  safeThrowable(
    () => updateDoc(Plan, planId, { unlimitedUser: storeOwner.id }),
    //TODO: () => addFailedJob("key", event.payload)
    (error) => new Error((error as Error).message)
  );
});

// caching the updatedUser
eventBus.ofType<PlanSubscriptionUpdateEvent>("planSubscription.updated").subscribe((event) => {
  const { storeOwner, planName } = event.payload;
  if (planName === "unlimited") return;

  safeThrowable(
    () => cacheUser(storeOwner),
    (error) => new Error((error as Error).message)
  );
});
