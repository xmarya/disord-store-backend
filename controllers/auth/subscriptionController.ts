import { addDays, isPast } from "date-fns";
import { startSession } from "mongoose";
import { PLAN_TRIAL_PERIOD } from "../../_constants/ttl";
import { getOneDocById, updateDoc } from "../../_services/global";
import { updatePlanMonthlyStats } from "../../_services/plan/planService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getSubscriptionType } from "../../_utils/getSubscriptionType";
import { startSubscription } from "../../_utils/startSubscription";
import Plan from "../../models/planModel";
import User from "../../models/userModel";
import cacheUser from "../../externals/redis/cacheControllers/user";
import cacheStoreAndPlan from "../../externals/redis/cacheControllers/storeAndPlan";

export const createNewSubscribeController = catchAsync(async (request, response, next) => {
  /*✅*/

  const { planId, paidPrice } = request.body;
  if (!planId?.trim() || !paidPrice?.trim()) return next(new AppError(400, "الرجاء ادخال تفاصيل الباقة"));
  const plan = await getOneDocById(Plan, planId);
  if (!plan) return next(new AppError(404, "لايوجد باقة بهذا المعرف"));

  const updatedUser = await startSubscription(request.user.id, plan, paidPrice, "new");

  response.status(203).json({
    success: true,
    updatedUserSubscription: updatedUser?.subscribedPlanDetails,
  });
});

export const renewalSubscriptionController = catchAsync(async (request, response, next) => {
  const { planId, paidPrice } = request.body;
  if (!planId?.trim() || !paidPrice?.trim()) return next(new AppError(400, "الرجاء ادخال تفاصيل الباقة"));

  const plan = await getOneDocById(Plan, planId);
  if (!plan) return next(new AppError(404, "لايوجد باقة بهذا المعرف"));

  const currentPlanId = request.plan;
  const subscriptionType = await getSubscriptionType(currentPlanId, planId);
  if (!subscriptionType) return;

  const updatedUser = await startSubscription(request.user.id, plan, paidPrice, subscriptionType);

  response.status(203).json({
    success: true,
    updatedUserSubscription: updatedUser?.subscribedPlanDetails,
  });
});

export const cancelSubscriptionController = catchAsync(async (request, response, next) => {
  const { notes } = request.body; // TODO: for the admin log
  const userId = request.user.id;
  const user = await getOneDocById(User, userId, { select: ["subscribedPlanDetails"] });
  if (!user || !user.subscribedPlanDetails) return next(new AppError(404, "User has no active subscription"));

  const { subscribedPlanDetails } = user;

  const trialOver = isPast(addDays(subscribedPlanDetails.subscribeStarts, PLAN_TRIAL_PERIOD));

  if (trialOver) return next(new AppError(400, "the 10 days limit for cancellation is over"));

  const session = await startSession();
  const updatedUser = await session.withTransaction(async () => {
    //TODO: add an admin log
    await updatePlanMonthlyStats(subscribedPlanDetails.planName, subscribedPlanDetails.paidPrice, "cancellation", session);
    const updatedUser = await updateDoc(User, userId, { $unset: { subscribedPlanDetails: "" } }, { session });

    return updatedUser;
  });

  await session.endSession();

  //TODO: refund the money using the User's bank account.

  updatedUser && cacheUser(updatedUser);

  request.planExpiryDate = new Date();
  request.isPlanPaid = false;
  request.plan = "";

  // TODO: update the hash of StoreAndPlan
  await cacheStoreAndPlan(request.store, request.plan, request.isPlanPaid, request.planExpiryDate);

  response.status(200).json({
    success: true,
    updatedUser,
  });
});
