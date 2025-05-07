import { startSession } from "mongoose";
import { createNewUnlimitedUser, getUserById } from "../../../_services/user/userService";
import { UnlimitedPlanDataBody } from "../../../_Types/Plan";
import { UserDocument } from "../../../_Types/User";
import { catchAsync } from "../../../_utils/catchAsync";
import sanitisedData from "../../../_utils/sanitisedData";
import validateNewUserData from "../../../_utils/validators/validateNewUserData";
import { createUnlimitedPlan } from "../../../_services/plan/planService";
import { AppError } from "../../../_utils/AppError";
import { getAllDocs } from "../../../_services/global";
import User from "../../../models/userModel";

export const createUnlimitedUserController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);
  const isValid = await validateNewUserData(request, next);
  if (!isValid) return;

  const session = await startSession();
  try {
    session.startTransaction();
    const planData: UnlimitedPlanDataBody = {
      planName: "unlimited",
      price: { riyal: request.body.priceRiyal, dollar: request.body.priceDollar },
      features: request.body.features,
      quota: request.body.quota,
    };
    
    const newPlan = await createUnlimitedPlan(planData, session);

    const data: UserDocument = {
      userType: "storeOwner",
      subscribedPlanDetails: { planId: newPlan._id, planName: "unlimited", price: { riyal: request.body.price } },
      signMethod: "credentials",
      credentials: { ...request.body.password },
      ...request.body,
    };

    // STEP 1) create the user
    const newUser = await createNewUnlimitedUser(data, session);
    const { email, subscribedPlanDetails } = newUser;
    await session.commitTransaction();
    // STEP 2) send to the email with the price and the link of the invoice:
    const invoiceLink = "";
    response.status(201).json({
      success: true,
      email,
      subscribedPlanDetails,
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
  const users = await getAllDocs(User, request);
  if(!users) return next(new AppError(400, "no data was found"));

  response.status(200).json({
    success: true,
    users
  });
});
export const getOneUserController = catchAsync(async (request, response, next) => {
  const user = await getUserById(request.params.userId);
  if(!user) return next(new AppError(400, "couldn't find the user"));

  response.status(200).json({
    success: true,
    user
  });
});
export const deleteUsersController = catchAsync(async (request, response, next) => {

  //TODO; if the userType is storeOwner, then call the deleteStore before then delete the user
  response.status(204).json({
    success: true,
  });
});
