import getOnePlan from "@services/auth/plan/getOnePlan";
import { MongoId } from "@Types/Schema/MongoId";
import { err } from "neverthrow";
import createNewSubscriptionsLog from "./addNewSubscriptionsLog";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";
import eventBus from "@config/EventBus";
import { getSubscriptionType } from "@utils/subscriptions/getSubscriptionType";

async function renewalStoreOwnerSubscription(storeOwnerId: MongoId, currentPlanId: MongoId, newPlanId: MongoId, paidPrice: number) {
  const newPlanResult = await getOnePlan(newPlanId);
  if (!newPlanResult.ok && newPlanResult.reason === "not-found") return err("لايوجد باقة بهذا المعرف");
  if (!newPlanResult.ok) return newPlanResult;

  const subscriptionType = await getSubscriptionType(currentPlanId, newPlanId);

  const newPlanDocument = newPlanResult.result;

  const storeOwnerRenewalResult = await createNewSubscriptionsLog(storeOwnerId, newPlanDocument, paidPrice, subscriptionType);

  if (storeOwnerRenewalResult.ok) {
    const { result: storeOwnerRenewalDetails } = storeOwnerRenewalResult;
    const event: PlanSubscriptionUpdateEvent = {
      type: "planSubscription.updated",
      payload: {
        storeOwner: storeOwnerRenewalDetails,
        planName: newPlanDocument.planName,
        planId: newPlanDocument.id,
        profit: paidPrice,
        subscriptionType,
        planExpiryDate: storeOwnerRenewalDetails.subscribedPlanDetails.subscribeEnds,
      },
      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }

  return storeOwnerRenewalResult;
}

export default renewalStoreOwnerSubscription;
