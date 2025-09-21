import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Credentials from "@models/credentialsModel";
import { getOneDocByFindOne } from "@repositories/global";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const validateEmailConfirmation = catchAsync(async (request, response, next) => {
  const email = request.user.email;
  const credentials = await getOneDocByFindOne(Credentials, {condition: {email}, select:["emailConfirmed"]});
  if (!credentials) return next(returnError(new Failure()));

  const { emailConfirmed } = credentials;
  if (!emailConfirmed) return next(returnError(new Forbidden("the email address has not been confirmed yet. Please confirm the email address and try again")));

  request.emailConfirmed = emailConfirmed;
  next();
});

export default validateEmailConfirmation;

// https://stackoverflow.com/questions/36283377/http-status-for-email-not-verified
