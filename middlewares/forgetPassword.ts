import mongoose from "mongoose";
import { Model } from "@Types/Model";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import { getOneDocByFindOne } from "@repositories/global";
import { generateRandomToken } from "@utils/generateRandomToken";

export const forgetPassword = (Model: Extract<Model, "Admin" | "User">) =>
  catchAsync(async (request, response, next) => {
    const { email } = request.body;

    if (!email?.trim()) return next(new AppError(400, "Please provide a valid email address"));
    let randomToken, resetURL;
    const user = await getOneDocByFindOne(mongoose.model(Model), { condition: { email } }); /*REQUIRES TESTING*/
    // NOTE: I think it's gonna make the security more robust by not showing any sign in case the app didn't find an email.
    // only if there is a user then do the random token stuff

    if (user.id) {
      //STEP 2) generate random token and the reset URL:
      randomToken = await generateRandomToken(user, "forgetPassword");
      resetURL = `${request.protocol}://${request.get("host")}/api/v1/auth/resetPassword/${randomToken}`;
    }

    //STEP 3) return the GRT to the front-end to send it vie email using Resend:
    response.status(200).json({
      success: true,
      randomToken,
      resetURL,
      message: "You will receive the password reset token to your email if it is stored in our records.make sure to look into the junk folder in your email",
    });
  });
