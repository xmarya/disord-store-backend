import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../_data/constants";
import { MongoId } from "../_Types/MongoId";
import { StoreOwner } from "../_Types/User";
import { updatePlanMonthlyStats } from "../_services/plan/planService";
import { createNewSubscription } from "../_services/user/userService";
import { addDays } from "date-fns";
import { PlanDocument, SubscriptionTypes } from "../_Types/Plan";
import cacheUser from "./cacheControllers/user";

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

    return updatedUser
  });

  await session.endSession();

  updatedUser && await cacheUser(updatedUser);

  return updatedUser;
}
