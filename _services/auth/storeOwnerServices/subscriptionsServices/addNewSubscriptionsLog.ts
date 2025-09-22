import { MongoId } from "@Types/Schema/MongoId";
import { PlanDocument, SubscriptionTypes } from "@Types/Schema/Plan";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import getSubscriptionStartAndEndDates from "@utils/subscriptions/getSubscriptionStartAndEndDates";
import safeThrowable from "@utils/safeThrowable";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { StoreOwner } from "@Types/Schema/Users/StoreOwner";
import { createNewSubscription } from "@repositories/storeOwner/storeOwnerRepo";
import { startSession } from "mongoose";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Success } from "@Types/ResultTypes/Success";

async function createNewSubscriptionsLog(storeOwnerId: MongoId, newPlan: PlanDocument, paidPrice: number, subscriptionType: SubscriptionTypes) {
  const { id: planId, planName } = newPlan;
  const { subscribeStarts, subscribeEnds } = getSubscriptionStartAndEndDates();

  const userData: Pick<StoreOwner, "subscribedPlanDetails"> = {
    subscribedPlanDetails: {
      planId,
      planName,
      subscriptionType,
      paid: true,
      subscribeStarts,
      subscribeEnds,
      paidPrice,
    },
  };

  const session = await startSession();
  const storeOwnerPlanDetails = await session.withTransaction(async () => {
    const storeOwnerPlanDetails = await createNewSubscription(storeOwnerId, userData, session);
    if (storeOwnerPlanDetails) {
      const payload: PlanSubscriptionUpdatedEvent["payload"] = {
        storeOwner: storeOwnerPlanDetails,
        planName: newPlan.planName,
        planId: newPlan.id,
        profit: paidPrice,
        subscriptionType,
        planExpiryDate: storeOwnerPlanDetails.subscribedPlanDetails.subscribeEnds,
      };
      await createOutboxRecord<[PlanSubscriptionUpdatedEvent]>([{ type: "planSubscription-updated", payload }], session);
    }

    return storeOwnerPlanDetails;
  });

  await session.endSession();

  if (!storeOwnerPlanDetails) return new Failure();

  return new Success({ storeOwnerPlanDetails });
}

export default createNewSubscriptionsLog;
