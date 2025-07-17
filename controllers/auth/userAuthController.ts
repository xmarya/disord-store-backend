import type { Request, Response } from "express";
import { startSession } from "mongoose";
import { deleteDoc, getOneDocByFindOne, getOneDocById, updateDoc } from "../../_services/global";
import { UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";
import formatSubscriptionsLogs from "../../_utils/queryModifiers/formatSubscriptionsLogs";
import User from "../../models/userModel";
import { deleteStorePermanently } from "./storeControllers";
import mongoose from "mongoose";
import cacheUser from "../../_utils/cacheControllers/user";
import { removeFromCache } from "../../_utils/cacheControllers/globalCache";

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
  const { email, firstName, lastName }: Pick<UserDocument, "email" | "firstName" | "lastName"> = request.body;

  if (email) {
    const isEmailExist = await getOneDocByFindOne(User, { condition: { email } }); /*✅*/
    console.log("isEmailExist", isEmailExist);
    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني"));
  }

  if (firstName?.trim() === "" && lastName?.trim() === "") return next(new AppError(400, "الرجاء تعبئة حقول الاسم بالكامل"));

  const updatedUser = await updateDoc(User, userId, request.body);

  // update the cached data:
  updatedUser && cacheUser(updatedUser);
  response.status(203).json({
    success: true,
    updatedUser,
  });
});

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;
  let session:mongoose.ClientSession | null;
  let deletedUser: UserDocument | null;

  if (request.user.userType === "storeOwner") {
    session = await startSession();
    await session.withTransaction(async () => {
      await deleteStorePermanently(request.store, session);
      await deleteDoc(User, userId, { session });
    });
    session.endSession();
  } 
  
  else await deleteDoc(User, userId);

  response.status(204).json({
    success: true,
  });
});

export function logout(request: Request, response: Response) {
  removeFromCache(`User:${request.user.id}`);
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
