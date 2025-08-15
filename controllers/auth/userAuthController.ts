import type { Request, Response } from "express";
import eventBus from "../../_config/EventBus";
import { getOneDocById, updateDoc } from "../../_services/global";
import { deleteRegularUser, deleteStoreOwner } from "../../_services/user/deleteUserService";
import { UserDeletedEvent, UserUpdatedEvent } from "../../_Types/events/UserEvents";
import { UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";
import formatSubscriptionsLogs from "../../_utils/queryModifiers/formatSubscriptionsLogs";
import { deleteRedisHash } from "../../externals/redis/redisOperations/redisHash";
import User from "../../models/userModel";

export const getUserProfile = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const userProfile = await getOneDocById(User, userId, { select: ["firstName", "lastName", "email", "image", "phoneNumber"] });

  if (!userProfile) return next(new AppError(400, "لم يتم العثور على بيانات المستخدم"));

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

export const updateUserProfile = catchAsync(async (request, response, next) => {
  /*✅*/
  const userId = request.user.id;
  let { firstName, lastName }: Pick<UserDocument, "firstName" | "lastName"> = request.body;
  if (firstName?.trim() === "" && lastName?.trim() === "") return next(new AppError(400, "الرجاء تعبئة حقول الاسم بالكامل"));

  const updatedUser = await updateDoc(User, userId, request.body);

  // publish (emit) the event:
  if (updatedUser) {
    const event: UserUpdatedEvent = {
      type: "user.updated",
      payload: { userId, user: updatedUser },
      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }
  // await cacheUser(updatedUser);
  // await novuUpdateSubscriber(userId, updatedUser);
  response.status(203).json({
    success: true,
    updatedUser,
  });
});

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const user = await getOneDocById(User, userId, { select: ["userType", "myStore"] });

  if (!user) return next(new AppError(404, "no user with this id"));
  if (user.userType === "storeAssistant") return next(new AppError(400, "this route is not for deleting a storeAssistant"));

  if (user.userType === "storeOwner") await deleteStoreOwner(userId, user.myStore);
  else await deleteRegularUser(userId);

  const event: UserDeletedEvent = {
    type: "user.deleted",
    payload: { userId },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  response.status(204).json({
    success: true,
  });
});

export function logout(request: Request, response: Response) {
  deleteFromCache(`User:${request.user.id}`);
  request.user.userType === "storeOwner" && deleteRedisHash(`StoreAndPlan:${request.user.myStore}`);
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
