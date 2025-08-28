import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import createNewAdmin from "@services/auth/adminServices/adminAuth/createNewAdmin";
import createUnlimitedPlanAndStoreOwner from "@services/auth/adminServices/user/createUnlimitedStoreOwner";
import getAllUsersForAdmin from "@services/auth/adminServices/user/getAllUsersForAdmin";
import getOneUserForAdmin from "@services/auth/adminServices/user/getOneUserForAdmin";
import { UnlimitedPlanDataBody } from "@Types/Plan";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createAdminController = catchAsync(async (request, response, next) => {
  await createNewAdmin(request.body, { hostname: request.hostname, protocol: request.protocol });

  response.status(201).json({
    success: true,
    message: "a new admin was successfully created",
  });
});

export const createUnlimitedUserController = catchAsync(async (request, response, next) => {
  const { priceRiyal, priceDollar, features, quota } = request.body.plan;

  if (!quota) return next(new AppError(400, "please insert a plan quota"));
  if (!priceRiyal || !priceDollar) return next(new AppError(400, "Please enter the plan's prices in riyals and dollars."));

  const unlimitedPlanData: Omit<UnlimitedPlanDataBody, "planName"> = { price: { riyal: priceRiyal, dollar: priceDollar }, features, quota };
  const { email, subscribedPlanDetails } = await createUnlimitedPlanAndStoreOwner(unlimitedPlanData, request.body.user);

  if (!email || !subscribedPlanDetails) return next(new AppError(500, INTERNAL_ERROR_MESSAGE));
  //TODO: create an invoice and send its link and details to the email:
  const invoiceLink = "Invoice URL";

  response.status(201).json({
    success: true,
    data: {
      email,
      subscribedPlanDetails,
      invoiceLink,
    },
  });
});

export const getAllUsersController = catchAsync(async (request, response, next) => {
  const { query } = request;
  const result = await getAllUsersForAdmin(query);
  if (!result.ok) return next(returnError(result));

  const { result: users } = result;
  response.status(200).json({
    success: true,
    data: { users },
  });
});

export const getOneUserController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;
  const result = await getOneUserForAdmin(userId);
  if (!result.ok) return next(returnError(result));

  const { result: user } = result;
  response.status(200).json({
    success: true,
    data: { user },
  });
});
