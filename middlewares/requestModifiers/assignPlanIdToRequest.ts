import getStoreOwnerSubscriptionsLog from "@services/auth/storeOwnerServices/subscriptionsServices/getStoreOwnerSubscriptionsLog";
import getStoreOf from "@services/auth/storeServices/getStoreOfOwner";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import cacheStoreAndPlan from "../../externals/redis/cacheControllers/storeAndPlan";

const assignPlanIdToRequest = catchAsync(async (request, response, next) => {
console.log("assignPlanIdToRequest");
  // if the plan is exist from the previous cache middleware
  if (request.plan) return next();
  // NOTE: I'm only checking using the plan, as it the only value that tells me if the user has
  // a running subscription or not. inside cancelSubscriptionController I'm setting the plan to empty string which is a false value.

  const getStoreResult = await getStoreOf(request.user.id);
  if (!getStoreResult.ok) return next(returnError(getStoreResult));

  const {result: store} = getStoreResult;

  const getOwnerResult = await getStoreOwnerSubscriptionsLog(store.owner);
  if (!getOwnerResult.ok) return next(returnError(getOwnerResult));

  const {result: {currentSubscription, currentSubscriptionDetails}} = getOwnerResult;

  request.plan = currentSubscription.planId;
  request.isPlanPaid = currentSubscription.paid;
  request.planExpiryDate = currentSubscriptionDetails.subscribeEnds;

  // since the code progressed until this point, that mean the data are not available in the cache.
  // so, cache them without awaiting:
  await cacheStoreAndPlan({store: request.store, plan: request.plan, isPaid: request.isPlanPaid, planExpiryDate:request.planExpiryDate});
  next();
});

export default assignPlanIdToRequest;
