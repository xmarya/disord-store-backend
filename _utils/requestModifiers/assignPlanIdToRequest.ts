import { getOneDocById } from "../../_services/global";
import Store from "../../models/storeModel";
import User from "../../models/userModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const assignPlanIdToRequest = catchAsync(async (request, response, next) => {
  console.log("assignPlanIdToRequest");
  /* SOLILOQUY: 
    in case the user was an assistant, there is no data about the plan,
    I could only know the storeId through the request.store

    the store has inPlan field which only stores the name of the plan,
    However, it has the owner field which I can use to get the plan
    */
  const storeId = request.store;
  const store = await getOneDocById(Store, storeId, {select: ["owner"]});

  if (!store) return next(new AppError(400, "couldn't find the store"));

  const owner = await getOneDocById(User, store.owner, {select: ["subscribedPlanDetails"]});
  if (!owner) return next(new AppError(400, "couldn't find the store owner"));

  request.plan = owner.subscribedPlanDetails.planId;
  request.isPlanPaid = owner.subscribedPlanDetails.paid;
  request.planExpiryDate = owner.subscribedPlanDetails.subscribeEnds;

  next();
});

export default assignPlanIdToRequest;
