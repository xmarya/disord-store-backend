import { getOneDocById } from "../../_services/global";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getSubscriptionType } from "../../_utils/getSubscriptionType";
import { startSubscription } from "../../_utils/startSubscription";
import Plan from "../../models/planModel";

export const createNewSubscribe = catchAsync(async (request, response, next) => {
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

export const renewalSubscription = catchAsync(async (request, response, next) => {
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

export const cancelSubscription = catchAsync(async (request, response, next) => {});
