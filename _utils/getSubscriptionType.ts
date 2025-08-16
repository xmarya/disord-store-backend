import { planTiers } from "../_constants/dataStructures";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { SubscriptionTypes } from "@Types/Plan";
import Plan from "@models/planModel";

export async function getSubscriptionType(currentPlanId: MongoId, newPlanId: MongoId): Promise<Exclude<SubscriptionTypes, "new"> | null> {
  // 1- make both tostring to comparison:
  const toStringPlanIds = Array.from([currentPlanId, newPlanId], (planId) => planId.toString());
  if (toStringPlanIds[0] === toStringPlanIds[1]) return "renewal";

  const [currentPlan, newPlan] = await Promise.all([getOneDocById(Plan, currentPlanId, { select: ["planName"] }), getOneDocById(Plan, newPlanId, { select: ["planName"] })]);
  if (!currentPlan || !newPlan) return null;

  const subscriptionType = planTiers[newPlan.planName] > planTiers[currentPlan.planName] ? "upgrade" : "downgrade";
  return subscriptionType;
}
