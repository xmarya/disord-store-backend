import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../_data/constants";
import { MongoId } from "../_Types/MongoId";
import { StoreOwner } from "../_Types/User";
import { updatePlanMonthlyStats } from "../_services/plan/planService";
import { startNewSubscription } from "../_services/user/userService";
import { AppError } from "./AppError";
import { addDays } from "date-fns";
import { PlanDocument, SubscriptionTypes } from "../_Types/Plan";

export async function startSubscription(userId: MongoId, plan: PlanDocument, paidPrice:number, subscriptionType:SubscriptionTypes) {
    const {id:planId, planName} = plan;
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

  let updatedUser;
  const session = await startSession();
  try {
    session.startTransaction();

    await updatePlanMonthlyStats(plan.planName, plan.price.riyal, subscriptionType, session);
    updatedUser = await startNewSubscription(userId, userData, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log((error as Error).message);
    throw new AppError(500, "حدث خطأ أثناء معالجة العملية. الرجاء المحاولة مجددًا");
  } finally {
    await session.endSession();
  }

  return updatedUser;
}
