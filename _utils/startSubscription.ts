import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../_constants/ttl";
import { MongoId } from "../_Types/MongoId";
import { StoreOwner } from "../_Types/User";
import { updatePlanMonthlyStats } from "../_repositories/plan/planRepo";
import { createNewSubscription } from "../_repositories/user/userRepo";
import { addDays } from "date-fns";
import { PlanDocument, SubscriptionTypes } from "../_Types/Plan";
import cacheUser from "../externals/redis/cacheControllers/user";

export async function startSubscription(userId: MongoId, plan: PlanDocument, paidPrice: number, subscriptionType: SubscriptionTypes) {
  const { id: planId, planName } = plan;
  const subscribeStarts = new Date();
  const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD);

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

  const updatedUser = await session.withTransaction(async () => {
    await updatePlanMonthlyStats(plan.planName, paidPrice, subscriptionType, session);
    const updatedUser = await createNewSubscription(userId, userData, session);

    return updatedUser;
  });

  await session.endSession();

  updatedUser && (await cacheUser(updatedUser));

  return updatedUser;
}
