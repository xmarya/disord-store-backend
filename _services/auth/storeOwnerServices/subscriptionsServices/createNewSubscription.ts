import getOnePlan from "@services/auth/plan/getOnePlan";
import { MongoId } from "@Types/Schema/MongoId";
import { err } from "neverthrow";
import createNewSubscriptionsLog from "./addNewSubscriptionsLog";
import eventBus from "@config/EventBus";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";

async function createNewPlanSubscription(storeOwner: MongoId, planId: MongoId, paidPrice: number) {
  const planResult = await getOnePlan(planId);
  if (!planResult.ok && planResult.reason === "not-found") return err("لايوجد باقة بهذا المعرف");
  if (!planResult.ok) return planResult;

  const { result: plan } = planResult;

  const updatedStoreOwnerResult = await createNewSubscriptionsLog(storeOwner, plan, paidPrice, "new");

  if (updatedStoreOwnerResult.ok) {
    const { result: updatedStoreOwner } = updatedStoreOwnerResult;
    const event: PlanSubscriptionUpdateEvent = {
      type: "planSubscription-updated",
      payload: {
        storeOwner: updatedStoreOwner,
        planId,
        planName: plan.planName,
        profit: paidPrice,
        subscriptionType: "new",
        planExpiryDate: updatedStoreOwner.subscribedPlanDetails.subscribeEnds,
      },
      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }

  return updatedStoreOwnerResult;
}

export default createNewPlanSubscription;
