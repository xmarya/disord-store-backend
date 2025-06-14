import { addDays } from "date-fns";
import type { Request, Response } from "express";
import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../../_data/constants";
import { getOneDocByFindOne, getOneDocById, updateDoc } from "../../_services/global";
import { updatePlanMonthlyStats } from "../../_services/plan/planService";
import { StoreOwner, UserDocument } from "../../_Types/User";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import jwtSignature from "../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../_utils/jwtToken/tokenWithCookies";
import Plan from "../../models/planModel";
import User from "../../models/userModel";
import formatSubscriptionsLogs from "../../_utils/queryModifiers/formatSubscriptionsLogs";
import Admin from "../../models/adminModel";
import { comparePasswords } from "../../_utils/passwords/comparePasswords";

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
  const user = await getOneDocById(User, userId, {select: ["credentials"]});

  if (!user) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(currentPassword, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  user.credentials.password = newPassword;
  await user.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(userId, "1h");
  tokenWithCookies(response, token);

  response.status(201).json({
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

  const updatedUser = await updateDoc(User, userId, request.body)

  response.status(201).json({
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

  const userId = request.user.id;
  const subscribeStarts = new Date();
  const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD); // what is the format of this? is it plain JS Date object?
  const userData: Partial<StoreOwner> = {
    subscribedPlanDetails: {
      planId: planId,
      planName: plan.planName,
      // originalPrice: plan.price.riyal,
      subscriptionType: "new",
      paid: true,
      subscribeStarts,
      subscribeEnds,
      paidPrice,
    },
  };

  let updatedUser;
  const session = await startSession();
  try {
    session.startTransaction();
    // first update the Plan, then update the User
    await updatePlanMonthlyStats(plan.planName, plan.price.riyal, "new", session);
    updatedUser = await updateDoc(User, userId, userData, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log((error as Error).message);
    throw new AppError(500, "حدث خطأ أثناء معالجة العملية. الرجاء المحاولة مجددًا");
  } finally {
    await session.endSession();
  }

  response.status(201).json({
    success: true,
    updatedUser,
  });
});

export const renewalSubscription = catchAsync(async (request, response, next) => {});

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccount = catchAsync(async (request, response, next) => {});

export function logout(request: Request, response: Response) {
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
