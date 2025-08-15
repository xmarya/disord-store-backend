import { getOneDocById } from "../../_services/global";
import Store from "../../models/storeModel";
import User from "../../models/userModel";
import { AppError } from "../AppError";
import cacheStoreAndPlan from "../cacheControllers/storeAndPlan";
import { catchAsync } from "../catchAsync";

const assignPlanIdToRequest = catchAsync(async (request, response, next) => {
  // console.log("assignPlanIdToRequest");
  /* SOLILOQUY: 
    in case the user was an assistant, there is no data about the plan,
    I could only know the storeId through the request.store

    the store has inPlan field which only stores the name of the plan,
    However, it has the owner field which I can use to get the plan
    */

  // if the plan is exist from the previous cache middleware
  if (request.plan) return next();
  // NOTE: I'm only checking using the plan, as it the only value that tells me if the user has
  // a running subscription or not. inside cancelSubscriptionController I'm setting the plan to empty string which is a false value.


  const storeId = request.store;
  const store = await getOneDocById(Store, storeId, { select: ["owner"] });

  if (!store) return next(new AppError(404, "couldn't find the store"));

  // TODO: skip the query if the user is the store owner
  const owner = await getOneDocById(User, store.owner, { select: ["subscribedPlanDetails"] });
  if (!owner) return next(new AppError(404, "couldn't find the store owner"));

  request.plan = owner.subscribedPlanDetails.planId;
  request.isPlanPaid = owner.subscribedPlanDetails.paid;
  request.planExpiryDate = owner.subscribedPlanDetails.subscribeEnds;

  // since the code progressed until this point, that mean the data are not available in the cache.
  // so, cache them without awaiting:
  await cacheStoreAndPlan(request.store, request.plan, request.isPlanPaid, request.planExpiryDate);
  next();
});

export default assignPlanIdToRequest;
