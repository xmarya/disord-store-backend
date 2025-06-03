import { startSession } from "mongoose";
import { createDoc, getAllDocs, getOneDocByFindOne, getOneDocById, updateDoc } from "../../../_services/global";
import { createUnlimitedPlan, updatePlanMonthlyStats } from "../../../_services/plan/planService";
import { createNewUnlimitedUser } from "../../../_services/user/userService";
import { UnlimitedPlanDataBody } from "../../../_Types/Plan";
import { AppError } from "../../../_utils/AppError";
import { comparePasswords } from "../../../_utils/authUtils";
import { catchAsync } from "../../../_utils/catchAsync";
import jwtSignature from "../../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../../_utils/jwtToken/tokenWithCookies";
import Admin from "../../../models/adminModel";
import User from "../../../models/userModel";
import { addDays } from "date-fns";
import { SUBSCRIPTION_PERIOD } from "../../../_data/constants";
import Plan from "../../../models/planModel";
import { MongoId } from "../../../_Types/MongoId";

export const adminLoginController = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  if (!email?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const admin = await getOneDocByFindOne(Admin, { condition: { email }, select: ["credentials"] });
  if (!admin) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  console.log("adminLoginController", admin);
  if (!(await comparePasswords(password, admin.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));
  console.log("ADMIN ID", admin.id);
  //STEP 3) create the token:
  const token = jwtSignature(admin.id, "1h");
  tokenWithCookies(response, token);

  response.status(200).json({
    success: true,
    token,
  });
});

export const createAdminController = catchAsync(async (request, response, next) => {
  const data = { ...request.body, credentials: { password: request.body.password } };
  await createDoc(Admin, data);

  response.status(201).json({
    success: true,
  });
});

export const createUnlimitedUserController = catchAsync(async (request, response, next) => {
  const { priceRiyal, priceDollar, features, quota } = request.body.plan;

  if(!quota) return next(new AppError(400, "please insert a plan quota"));
  if (!priceRiyal || !priceDollar) return next(new AppError(400, "Please enter the plan's prices in riyals and dollars."));
  if (isNaN(priceRiyal) || isNaN(priceDollar)) return next(new AppError(400, "the prices should be of type number"));

  const session = await startSession();
  try {
    session.startTransaction();
    const planData: UnlimitedPlanDataBody = {
      planName: "unlimited",
      price: { riyal: priceRiyal, dollar: priceDollar },
      features,
      quota,
    };

    // STEP 1) create the unlimited plan:
    const newPlan = await createUnlimitedPlan(planData, session);

    const subscribeStarts = new Date();
    const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD);
    const data = {
      ...request.body.user,
      subscribedPlanDetails: { 
        planId: newPlan._id, planName:"unlimited", 
        paidPrice: newPlan.price.riyal,
        subscribeStarts, subscribeEnds,
        paid:false,
      },
    };

    // STEP 2) create the user
    const newUser = await createNewUnlimitedUser(data, session);

    // STEP 3) link the plan to the user:
    await updateDoc(Plan, (newPlan._id as MongoId), {unlimitedUser: newUser._id}, {session});

    // STEP 4) update the plans stats:
    const {subscriptionType} = request.body.user;
    await updatePlanMonthlyStats("unlimited", priceRiyal, subscriptionType, session);

    await session.commitTransaction();

    // STEP 5)
    //TODO: create an invoice and send its link and details to the email:
    const invoiceLink = "Invoice";

    response.status(201).json({
      success: true,
      email: newUser.email,
      subscribedPlanDetails: newUser.subscribedPlanDetails,
      invoiceLink,
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    throw new AppError(500, "something went wrong, Please try again.");
  } finally {
    await session.endSession();
  }
});

export const getAllUsersController = catchAsync(async (request, response, next) => {
  const users = await getAllDocs(User, request, { select: ["firstName", "lastName", "email", "image", "userType"] });
  if (!users) return next(new AppError(400, "no data was found"));

  response.status(200).json({
    success: true,
    users,
  });
});

export const getOneUserController = catchAsync(async (request, response, next) => {
  const user = await getOneDocById(User, request.params.userId, { select: ["-bankAccounts", "-addresses"] });
  if (!user) return next(new AppError(400, "couldn't find a user with this id"));
  response.status(200).json({
    success: true,
    user,
  });
});

export const deleteUsersController = catchAsync(async (request, response, next) => {
  //TODO; if the userType is storeOwner, then call the deleteStore before then delete the user
  response.status(204).json({
    success: true,
  });
});
