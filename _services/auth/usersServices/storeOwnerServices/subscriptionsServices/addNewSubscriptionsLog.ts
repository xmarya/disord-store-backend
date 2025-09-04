import { MongoId } from "@Types/MongoId";
import { PlanDocument, SubscriptionTypes } from "@Types/Plan";
import { StoreOwner } from "@Types/User";
import { createNewSubscription } from "@repositories/user/userRepo";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import getSubscriptionStartAndEndDates from "@utils/subscriptions/getSubscriptionStartAndEndDates";
import safeThrowable from "@utils/safeThrowable";
import { Failure } from "@Types/ResultTypes/errors/Failure";

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

  const safeUpdateStoreOwner = safeThrowable(
    () => createNewSubscription(storeOwnerId, userData),
    (error) => new Failure((error as Error).message)
  );


  return extractSafeThrowableResult(() => safeUpdateStoreOwner);
}

export default createNewSubscriptionsLog;
