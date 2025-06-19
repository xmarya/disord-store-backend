import { addDays, isPast } from "date-fns";
import { startSession } from "mongoose";
import { PLAN_TRIAL_PERIOD } from "../../_data/constants";
import { getOneDocById, updateDoc } from "../../_services/global";
import { updatePlanMonthlyStats } from "../../_services/plan/planService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getSubscriptionType } from "../../_utils/getSubscriptionType";
import { startSubscription } from "../../_utils/startSubscription";
import Plan from "../../models/planModel";
import User from "../../models/userModel";

export const createNewSubscribeController = catchAsync(async (request, response, next) => {
  /*✅*/
  console.log("createNewSubscribe");
  const { planId, paidPrice } = request.body;
  if (!planId?.trim() || !paidPrice?.trim()) return next(new AppError(400, "الرجاء ادخال تفاصيل الباقة"));
  const plan = await getOneDocById(Plan, planId);
  if (!plan) return next(new AppError(400, "لايوجد باقة بهذا المعرف"));

  const updatedUser = await startSubscription(request.user.id, plan, paidPrice, "new");

  response.status(203).json({
    success: true,
    updatedUserSubscription: updatedUser?.subscribedPlanDetails,
  });
});

export const renewalSubscriptionController = catchAsync(async (request, response, next) => {
  console.log("renewalSubscription");
  const { planId: newPlanId, paidPrice } = request.body;
  if (!newPlanId?.trim() || !paidPrice?.trim()) return next(new AppError(400, "الرجاء ادخال تفاصيل الباقة"));

  const plan = await getOneDocById(Plan, newPlanId);
  if (!plan) return next(new AppError(400, "لايوجد باقة بهذا المعرف"));

  const currentPlanId = request.plan; // will this be available after the 30 days?
  const subscriptionType = await getSubscriptionType(currentPlanId, newPlanId);
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
  if (!user || !user.subscribedPlanDetails) return next(new AppError(400, "User has no active subscription"));

  const { subscribedPlanDetails } = user;

  const trialOver = isPast(addDays(subscribedPlanDetails.subscribeStarts, PLAN_TRIAL_PERIOD));

  if (trialOver) return next(new AppError(400, "the 10 days limit for cancellation is over"));

  let updatedUser;
  const session = await startSession();
  await session.withTransaction(async () => {
    //TODO: add an admin log
    await updatePlanMonthlyStats(subscribedPlanDetails.planName, subscribedPlanDetails.paidPrice, "cancellation", session);
    await updateDoc(User, userId, { $unset: { subscribedPlanDetails: "" } }, { session });

    //TODO: refund the money using the User's bank account.
  });

  await session.endSession();

  request.planExpiryDate = new Date();
  request.isPlanPaid = false;
  request.plan = "";

  response.status(200).json({
    success: true,
    updatedUser,
  });
});
