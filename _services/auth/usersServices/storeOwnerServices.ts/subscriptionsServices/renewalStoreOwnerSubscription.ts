import getOnePlan from "@services/auth/plan/getOnePlan";
import { MongoId } from "@Types/MongoId";
import { getSubscriptionType } from "@utils/getSubscriptionType";
import { err } from "neverthrow";
import createNewSubscriptionsLog from "./addNewSubscriptionsLog";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";
import eventBus from "@config/EventBus";

async function renewalStoreOwnerSubscription(storeOwnerId:MongoId, currentPlanId:MongoId, newPlanId: MongoId, paidPrice: number) {
  const newPlanResult = await getOnePlan(newPlanId);
  if (!newPlanResult.ok && newPlanResult.reason === "not-found") return err("لايوجد باقة بهذا المعرف");
  if (!newPlanResult.ok) return newPlanResult;

  const subscriptionType = await getSubscriptionType(currentPlanId, newPlanId);

  const newPlanDocument = newPlanResult.result;

  const storeOwnerRenewalDetails = await createNewSubscriptionsLog(storeOwnerId, newPlanDocument, paidPrice, subscriptionType);

  if(storeOwnerRenewalDetails.ok) {
      const event:PlanSubscriptionUpdateEvent = {
    type:"planSubscription.updated",
    payload: {
      storeOwner: storeOwnerRenewalDetails.result,
      planName: newPlanDocument.planName,
      planId: newPlanDocument.id,
      profit: paidPrice,
      subscriptionType
    },
    occurredAt: new Date(),
  }

  eventBus.publish(event);
  }

  return storeOwnerRenewalDetails;
}

export default renewalStoreOwnerSubscription;
