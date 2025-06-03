import { getOneDocById } from "../../_services/global";
import User from "../../models/userModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const validateEmailConfirmation = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const user = await getOneDocById(User, userId, { select: ["credentials"] });
  if (!user) return next(new AppError(400, "something went wrong while processing your request. Please try again later"));

  const { emailConfirmed } = user.credentials;
  if (!emailConfirmed) return next(new AppError(403, "the email address has not been confirmed yet. Please confirm the email address and try again"));

  next();
});

export default validateEmailConfirmation;

// https://stackoverflow.com/questions/36283377/http-status-for-email-not-verified
