import Admin from "@models/adminModel";
import Plan from "@models/planModel";
import { createDoc, updateDoc } from "@repositories/global";
import { createUnlimitedPlan, updatePlanMonthlyStats } from "@repositories/plan/planRepo";
import { createNewUnlimitedUser } from "@repositories/user/userRepo";
import getAllUsers from "@services/adminServices/getAllUsers";
import getOneUser from "@services/adminServices/getOneUser";
import { MongoId } from "@Types/MongoId";
import { UnlimitedPlanDataBody } from "@Types/Plan";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import generateEmailConfirmationToken from "@utils/email/generateEmailConfirmationToken";
import { addDays } from "date-fns";
import { startSession } from "mongoose";
import { SUBSCRIPTION_PERIOD } from "../../../_constants/ttl";
import novuSendWelcome from "../../../externals/novu/workflowTriggers/welcomeEmail";

export const createAdminController = catchAsync(async (request, response, next) => {
  const data = { ...request.body, credentials: { password: request.body.password } };
  const admin = await createDoc(Admin, data);

  const confirmUrl = await generateEmailConfirmationToken(admin, request);
  await novuSendWelcome("welcome-admin", admin, confirmUrl);

  response.status(201).json({
    success: true,
  });
});

export const createUnlimitedUserController = catchAsync(async (request, response, next) => {
  const { priceRiyal, priceDollar, features, quota } = request.body.plan;

  if (!quota) return next(new AppError(400, "please insert a plan quota"));
  if (!priceRiyal || !priceDollar) return next(new AppError(400, "Please enter the plan's prices in riyals and dollars."));

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
    const invoiceLink = "Invoice URL";

    response.status(201).json({
      success: true,
      data: {
        email: newUser.email,
      subscribedPlanDetails: newUser.subscribedPlanDetails,
      invoiceLink,
      }
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
  const {query} = request;
  const result = await getAllUsers(query);
  if (!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  const { result: users } = result;
  response.status(200).json({
    success: true,
    data: {users},
  });
});

export const getOneUserController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;
  const result = await getOneUser(userId);
  if (!result.ok) return next(new AppError(404, `${result.reason}: ${result.message}`));

  const { result: user } = result;
  response.status(200).json({
    success: true,
    data: {user},
  });
});
