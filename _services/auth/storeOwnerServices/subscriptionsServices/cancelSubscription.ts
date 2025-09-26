import { updateDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import isTrialOver from "@utils/subscriptions/isTrialOver";
import getStoreOwnerSubscriptionsLog from "./getStoreOwnerSubscriptionsLog";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import StoreOwner from "@models/storeOwnerModel";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { startSession } from "mongoose";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { Success } from "@Types/ResultTypes/Success";

async function cancelSubscription(storeOwnerId: MongoId, cancelledPlanId: MongoId, cancellationNote?: string) {
  const subscriptionsLog = await getStoreOwnerSubscriptionsLog(storeOwnerId);
  if (!subscriptionsLog.ok) return subscriptionsLog;

  const {
    result: { currentSubscription, currentSubscriptionDetails },
  } = subscriptionsLog;

  const isOver = isTrialOver(currentSubscriptionDetails.subscribeStarts);

  if (isOver) return new Forbidden("the 10 days limit for cancellation is over");

  const session = await startSession();
  const updatedStoreOwner = await session.withTransaction(async () => {
    const updatedStoreOwner = await updateDoc(StoreOwner, storeOwnerId, { $unset: { subscribedPlanDetails: "" } }, { session });

    if (updatedStoreOwner) {
      const payload: PlanSubscriptionUpdatedEvent["payload"] = {
        storeOwner: updatedStoreOwner,
        planId: cancelledPlanId,
        planName: currentSubscription.planName,
        profit: currentSubscription.paidPrice,
        subscriptionType: "cancellation",
        planExpiryDate: new Date(),
      };

      await createOutboxRecord<[PlanSubscriptionUpdatedEvent]>([{ type: "planSubscription-updated", payload }], session);
    }

    return updatedStoreOwner;
  });
  await session.endSession();

  //TODO: refund the money using the User's bank account.
  //TODO: add an admin log

  if (!updatedStoreOwner) return new Failure();
  return new Success({ updatedStoreOwner, planExpiryDate: new Date(), isPlanPaid: false, plan: "" });
}

export default cancelSubscription;
