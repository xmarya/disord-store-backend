import { PLAN_TRIAL_PERIOD } from "@constants/ttl";
import { MongoId } from "@Types/MongoId";
import getStoreOwnerSubscriptionsLog from "./getStoreOwnerSubscriptionsLog";
import { addDays, isPast } from "date-fns";
import isTrialOver from "@utils/subscriptions/isTrialOver";
import { err } from "neverthrow";
import { updateDoc } from "@repositories/global";
import User from "@models/userModel";
import safeThrowable from "@utils/safeThrowable";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import eventBus from "@config/EventBus";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";

async function cancelSubscription(storeOwnerId: MongoId, cancelledPlanId:MongoId, cancellationNote?: string) {
  const subscriptionsLog = await getStoreOwnerSubscriptionsLog(storeOwnerId);
  if (!subscriptionsLog.ok) return subscriptionsLog;

  const {
    result: { currentSubscription },
  } = subscriptionsLog;

  const isOver = isTrialOver(currentSubscription.currentSubscriptionDetails.subscribeStarts);

  if (isOver) return err("the 10 days limit for cancellation is over");

  const safeUpdateStoreOwner = safeThrowable(
    () => updateDoc(User, storeOwnerId, { $unset: { subscribedPlanDetails: "" } }),
    (error) => new Error((error as Error).message)
  );

  const updateResult = await extractSafeThrowableResult(() => safeUpdateStoreOwner);
  if(!updateResult.ok) return updateResult;

  const event:PlanSubscriptionUpdateEvent = {
    type: "planSubscription.updated",
    payload: {
        storeOwner: updateResult.result,
        planId: cancelledPlanId,
        planName: currentSubscription.currentSubscription.planName,
        profit: currentSubscription.currentSubscription.paidPrice,
        subscriptionType: "cancellation",
        planExpiryDate: new Date()
    },
    occurredAt: new Date(),
  }

  eventBus.publish(event);
  //TODO: refund the money using the User's bank account.
  //TODO: add an admin log


  return { ...updateResult, result: updateResult.result, planExpiryDate: new Date(), isPlanPaid: false, plan: "" };
}

export default cancelSubscription;
