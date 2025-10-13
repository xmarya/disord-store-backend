import { catchAsync } from "@utils/catchAsync";
import cancelSubscription from "@services/auth/storeOwnerServices/subscriptionsServices/cancelSubscription";
import createNewPlanSubscription from "@services/auth/storeOwnerServices/subscriptionsServices/createNewSubscription";
import getStoreOwnerSubscriptionsLog from "@services/auth/storeOwnerServices/subscriptionsServices/getStoreOwnerSubscriptionsLog";
import renewalStoreOwnerSubscription from "@services/auth/storeOwnerServices/subscriptionsServices/renewalStoreOwnerSubscription";
import isErr from "@utils/isErr";
import returnError from "@utils/returnError";

export const createNewSubscribeController = catchAsync(async (request, response, next) => {
  const { planId, paidPrice } = request.body;
  if (!planId?.trim() || !paidPrice) return next(returnError({ reason: "bad-request", message: "الرجاء ادخال تفاصيل الباقة" }));

  const result = await createNewPlanSubscription(request.user.id, planId, paidPrice);
  if (!result?.ok) return next(returnError(result));

  const { result: updatedStoreOwner } = result;

  response.status(203).json({
    success: true,
    data: updatedStoreOwner.storeOwnerPlanDetails,
  });
});

export const getMySubscriptionsLogController = catchAsync(async (request, response, next) => {
  const result = await getStoreOwnerSubscriptionsLog(request.user.id);
  if (!result.ok) return next(returnError(result));

  const {
    result: { currentSubscription, subscriptionsLog },
  } = result;

  response.status(200).json({
    success: true,
    data: {
      currentSubscription,
      subscriptionsLog,
    },
  });
});

export const renewalSubscriptionController = catchAsync(async (request, response, next) => {
  const { planId, paidPrice } = request.body;
  if (!planId?.trim() || !paidPrice) return next(returnError({ reason: "bad-request", message: "الرجاء ادخال تفاصيل الباقة" }));

  const currentPlanId = planId;
  const storeOwnerId = request.user.id;
  const result = await renewalStoreOwnerSubscription(storeOwnerId, currentPlanId, planId, paidPrice);
  if (!result.ok) return next(returnError(result));

  const { result: renewalData } = result;
  response.status(203).json({
    success: true,
    data: renewalData.storeOwnerPlanDetails,
  });
});

export const cancelSubscriptionController = catchAsync(async (request, response, next) => {
  const { notes } = request.body; // TODO: for the admin log
  const result = await cancelSubscription(request.user.id, request.plan, notes);

  if (!result.ok) return next(returnError(result));

  const {
    result: { updatedStoreOwner, plan, planExpiryDate, isPlanPaid },
  } = result;

  request.plan = plan;
  request.isPlanPaid = isPlanPaid;
  request.planExpiryDate = planExpiryDate;

  response.status(200).json({
    success: true,
    data: updatedStoreOwner,
  });
});
