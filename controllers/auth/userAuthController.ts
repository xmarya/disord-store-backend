import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import deleteUser from "@services/auth/usersServices/deleteUser";
import getUserProfile from "@services/auth/usersServices/getUserProfile";
import { UserDocument } from "@Types/User";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import formatSubscriptionsLogs from "@utils/queryModifiers/formatSubscriptionsLogs";
import type { Request, Response } from "express";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import { deleteRedisHash } from "../../externals/redis/redisOperations/redisHash";
import returnError from "@utils/returnError";

export const getUserProfileController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await getUserProfile(userId);

  if (!result.ok) return next(returnError(result));
  const { result: userProfile } = result;

  response.status(200).json({
    success: true,
    data: {userProfile},
  });
});

export const getMySubscriptionsLogController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const userPlansLog = await getOneDocById(User, userId, { select: ["subscribedPlanDetails", "subscriptionsLog"] });
  if (!userPlansLog) return next(new AppError(400, "لم يتم العثور على البيانات المطلوبة"));

  const { subscribedPlanDetails, subscriptionsLog, planExpiresInDays } = userPlansLog as UserDocument & { planExpiresInDays: string };
  const currentSubscription = formatSubscriptionsLogs(subscribedPlanDetails, planExpiresInDays);

  response.status(200).json({
    success: true,
    data: {
      currentSubscription,
      subscriptionsLog,
    },
  });
});

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const result = await deleteUser(userId);

  if (result.isErr()) return next(new AppError(400, result.error));

  response.status(204).json({
    success: true,
    message: result.value,
  });
});

export function logout(request: Request, response: Response) {
  deleteFromCache(`User:${request.user.id}`);
  request.user.userType === "storeOwner" && deleteRedisHash(`StoreAndPlan:${request.user.myStore}`);
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
