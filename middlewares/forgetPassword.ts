import userForgetPassword from "@services/nonAuth/credentialsServices/passwords/UserForgetPassword";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const forgetPassword = catchAsync(async (request, response, next) => {
  const { email } = request.body;
  const emailTokenGenerator = { hostname: request.hostname, protocol: request.protocol };
  const result = await userForgetPassword(email, emailTokenGenerator);

  if (!result.ok) return next(returnError(result));

  const {
    result: { randomToken, resetURL },
  } = result;

  //STEP 3) return the GRT to the front-end to send it vie email using Resend:
  response.status(200).json({
    success: true,
    message: "You will receive the password reset token to your email if it is stored in our records.make sure to look into the junk folder in your email",
    data: {
      randomToken,
      resetURL,
    },
  });
});
