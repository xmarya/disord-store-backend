import type { Request, Response } from "express";
import { deleteDoc, getOneDocByFindOne, getOneDocById, updateDoc } from "../../_services/global";
import { UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";
import formatSubscriptionsLogs from "../../_utils/queryModifiers/formatSubscriptionsLogs";
import { startSubscription } from "../../_utils/startSubscription";
import Plan from "../../models/planModel";
import User from "../../models/userModel";
import { getSubscriptionType } from "../../_utils/getSubscriptionType";

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
  console.log("confirmUserChangePassword");

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

  response.status(203).json({
    success: true,
    updatedUser,
  });
});

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

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const deletedUser = await deleteDoc(User, userId);

  response.status(204).json({
    success: true,
  });
});

export function logout(request: Request, response: Response) {
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
