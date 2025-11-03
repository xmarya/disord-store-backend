import authenticaSendOTP from "@externals/authentica/authenticaSendOTP";
import authenticaVerifyOTP from "@externals/authentica/authenticaVerifyOTP";
import createNewDiscordUser from "@services/auth/usersServices/createNewDiscordUser";
import getCredentialsVerifyResult from "@services/nonAuth/credentialsServices/login/getCredentialsVerifyResult";
import loginMethodValidator from "@services/nonAuth/credentialsServices/login/loginMethodValidator";
import createNewUserAndSendConfirmationEmail from "@services/nonAuth/credentialsServices/signup/signupNewUserAndSendConfirmationEmail";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { catchAsync } from "@utils/catchAsync";
import jwtSignature from "@utils/jwtToken/generateSignature";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import returnError from "@utils/returnError";

export const oldCredentialsLogin = catchAsync(async (request, response, next) => {
  const result1 = loginMethodValidator(request.body);
  if (!result1.ok) return next(returnError(result1));
  const { result: loginMethod } = result1;
  const result2 = await getCredentialsVerifyResult(loginMethod, request.body.password);
  if (!result2.ok) return next(returnError(result2));

  const {
    result: { loggedInUser, emailConfirmed },
  } = result2;

  const token = jwtSignature(loggedInUser.id, loggedInUser.userType, "1h");
  tokenWithCookies(response, token);
  request.user = loggedInUser;
  request.emailConfirmed = emailConfirmed;

  response.status(200).json({
    success: true,
    data: {
      token,
    },
  });
});

export const createNewUserController = (userType: Extract<UserTypes, "user" | "storeOwner">) =>
  catchAsync(async (request, response, next) => {
    const tokenGenerator = { hostname: request.hostname, protocol: request.protocol };
    const newUser = await createNewUserAndSendConfirmationEmail({ userType, ...request.body }, tokenGenerator);

    response.status(201).json({
      success: true,
      message: "new user has been created successfully",
      data: newUser,
    });
  });

export const credentialsLogin = catchAsync(async (request, response, next) => {
  const result = loginMethodValidator(request.body);

  if (!result.ok) return next(returnError(result));
  const { result: loginMethod } = result;

  request.loginMethod = loginMethod;

  next();
});

export const sendOTP = catchAsync(async (request, response, next) => {
  const result = await authenticaSendOTP(request.user, request.loginMethod);

  if(!result.ok) return next(returnError(result));
  const {result: {message, loginMethod, temporeToken}} = result;

  response.status(200).json({
    success: true,
    message: `${message} to ${loginMethod}`,
    data: { temporeToken },
  });
});

export const verifyOTP = catchAsync(async (request, response, next) => {

  const result = await authenticaVerifyOTP(request.body);
  if(!result.ok) return next(returnError(result));
  const {result: {status, message, token}} = result;

  tokenWithCookies(response, token);

  response.status(200).json({
    success: status,
    message: message,
    data: {
      token /* CHANGE LATER: this is in the body for testing purposes */,
    },
  });
});

export const createNewDiscordUserController = catchAsync(async (request, response, next) => {
  const { email, id, name, avatar } = request.body;

  if (!email || !id || !name || !avatar) return next(new AppError(400, "some data are missing. make sure to provide the user email, id, name, and image"));

  const newDiscordUser = await createNewDiscordUser({ email, name, id, avatar });
  // TODO: give the user immediate access by generating the login token

  response.status(201).json({
    success: true,
    message: "new user has been created successfully",
    data: newDiscordUser
  });
});
