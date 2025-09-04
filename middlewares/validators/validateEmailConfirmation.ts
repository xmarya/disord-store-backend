import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Credentials from "@models/credentialsModel";
import { getOneDocByFindOne } from "@repositories/global";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

const validateEmailConfirmation = catchAsync(async (request, response, next) => {
  const email = request.user.email;
  const credentials = await getOneDocByFindOne(Credentials, {condition: {email}, select:["emailConfirmed"]});
  if (!credentials) return next(new AppError(500, INTERNAL_ERROR_MESSAGE));

  const { emailConfirmed } = credentials;
  if (!emailConfirmed) return next(new AppError(403, "the email address has not been confirmed yet. Please confirm the email address and try again"));

  next();
});

export default validateEmailConfirmation;

// https://stackoverflow.com/questions/36283377/http-status-for-email-not-verified
