import getCredentialsVerifyResult from "@services/nonAuth/credentialsServices/login/getCredentialsVerifyResult";
import { CredentialsLoginDataBody } from "@Types/Schema/Users/UserCredentials";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const verifyLoginData = catchAsync(async (request, response, next) => {
  const { password }: CredentialsLoginDataBody = request.body;

  const result = await getCredentialsVerifyResult(request.loginMethod, password);
  if (!result.ok) return next(returnError(result));

  const {
    result: { loggedInUser, emailConfirmed },
  } = result;

  request.user = loggedInUser;
  request.emailConfirmed = emailConfirmed;

  next();
});

export default verifyLoginData;
