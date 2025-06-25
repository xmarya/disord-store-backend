import { addDays } from "date-fns";
import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../../../_data/constants";
import { createDoc, getAllDocs, getOneDocById, updateDoc } from "../../../_services/global";
import { createUnlimitedPlan, updatePlanMonthlyStats } from "../../../_services/plan/planService";
import { createNewUnlimitedUser } from "../../../_services/user/userService";
import { MongoId } from "../../../_Types/MongoId";
import { UnlimitedPlanDataBody } from "../../../_Types/Plan";
import { AppError } from "../../../_utils/AppError";
import { catchAsync } from "../../../_utils/catchAsync";
import Admin from "../../../models/adminModel";
import Plan from "../../../models/planModel";
import User from "../../../models/userModel";

export const createAdminController = catchAsync(async (request, response, next) => {
  const data = { ...request.body, credentials: { password: request.body.password } };
  await createDoc(Admin, data);

  response.status(201).json({
    success: true,
  });
});

export const createUnlimitedUserController = catchAsync(async (request, response, next) => {
  const { priceRiyal, priceDollar, features, quota } = request.body.plan;

  if (!quota) return next(new AppError(400, "please insert a plan quota"));
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
        planId: newPlan._id,
        planName: "unlimited",
        paidPrice: newPlan.price.riyal,
        subscribeStarts,
        subscribeEnds,
        paid: false,
      },
    };

    // STEP 2) create the user
    const newUser = await createNewUnlimitedUser(data, session);

    // STEP 3) link the plan to the user:
    await updateDoc(Plan, newPlan._id as MongoId, { unlimitedUser: newUser._id }, { session });

    // STEP 4) update the plans stats:
    const { subscriptionType } = request.body.user;
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
  const user = await getOneDocById(User, request.params.userId);
  if (!user) return next(new AppError(400, "couldn't find a user with this id"));
  response.status(200).json({
    success: true,
    user,
  });
});

