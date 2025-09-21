import getOnePlan from "@services/auth/plan/getOnePlan";
import { MongoId } from "@Types/Schema/MongoId";
import { err } from "neverthrow";
import createNewSubscriptionsLog from "./addNewSubscriptionsLog";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";

async function createNewPlanSubscription(storeOwner: MongoId, planId: MongoId, paidPrice: number) {
  const planResult = await getOnePlan(planId);
  if (!planResult.ok && planResult.reason === "not-found") return new NotFound("لايوجد باقة بهذا المعرف");
  if (!planResult.ok) return planResult;

  const { result: plan } = planResult;

  const updatedStoreOwnerResult = await createNewSubscriptionsLog(storeOwner, plan, paidPrice, "new");

  return updatedStoreOwnerResult;
}

export default createNewPlanSubscription;
