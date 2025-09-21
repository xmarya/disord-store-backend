import getOnePlan from "@services/auth/plan/getOnePlan";
import { MongoId } from "@Types/Schema/MongoId";
import { err } from "neverthrow";
import createNewSubscriptionsLog from "./addNewSubscriptionsLog";
import { getSubscriptionType } from "@utils/subscriptions/getSubscriptionType";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";

async function renewalStoreOwnerSubscription(storeOwnerId: MongoId, currentPlanId: MongoId, newPlanId: MongoId, paidPrice: number) {
  const newPlanResult = await getOnePlan(newPlanId);
  if (!newPlanResult.ok && newPlanResult.reason === "not-found") return new NotFound("لايوجد باقة بهذا المعرف");
  if (!newPlanResult.ok) return newPlanResult;

  const subscriptionType = await getSubscriptionType(currentPlanId, newPlanId);

  const newPlanDocument = newPlanResult.result;

  const storeOwnerRenewalResult = await createNewSubscriptionsLog(storeOwnerId, newPlanDocument, paidPrice, subscriptionType);

  return storeOwnerRenewalResult;
}

export default renewalStoreOwnerSubscription;
