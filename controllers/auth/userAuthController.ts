import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import deleteUser from "@services/usersServices/deleteUser";
import getUserProfile from "@services/usersServices/getUserProfile";
import updateUser from "@services/usersServices/updateUser";
import { UserDocument } from "@Types/User";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import jwtSignature from "@utils/jwtToken/generateSignature";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "@utils/passwords/comparePasswords";
import formatSubscriptionsLogs from "@utils/queryModifiers/formatSubscriptionsLogs";
import type { Request, Response } from "express";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import { deleteRedisHash } from "../../externals/redis/redisOperations/redisHash";

export const getUserProfileController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await getUserProfile(userId);

  if (!result.ok) return next(new AppError(400, `${result.reason}: ${result.message}`));
  const { result: userProfile } = result;

  response.status(200).json({
    success: true,
    userProfile,
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
    currentSubscription,
    subscriptionsLog,
  });
});

export const confirmUserChangePassword = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const { currentPassword, newPassword } = request.body;
  const user = await getOneDocById(User, userId, { select: ["credentials"] });

  if (!user) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(currentPassword, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  user.credentials.password = newPassword;
  await user.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(userId, "1h");
  tokenWithCookies(response, token);

  response.status(203).json({
    success: true,
  });
});

export const updateUserProfileController = catchAsync(async (request, response, next) => {
  /*✅*/
  const userId = request.user.id;
  const result = await updateUser(userId, request.body);

  if ("isErr" in result) return next(new AppError(400, result.error));

  if (!result.ok) return next(new AppError(400, `${result.reason}: ${result.message}`));
  const { result: updatedUser } = result;
  response.status(203).json({
    success: true,
    updatedUser,
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
