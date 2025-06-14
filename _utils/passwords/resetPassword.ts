import crypto from "crypto";
import { Model } from "../../_Types/Model";
import { catchAsync } from "../catchAsync";
import { AppError } from "../AppError";
import mongoose from "mongoose";

export const resetPassword = (Model:Extract<Model, "Admin" | "User">) => catchAsync(async (request, response, next) => {
  console.log("resetPassword");

  //STEP 1) get the random token and compare it with the stored on in the db:
  const hashedToken = crypto.createHash("sha256").update(request.params.randomToken).digest("hex");

  const user = await mongoose.model(Model).findOne({
    "credentials.passwordResetToken": hashedToken,
    "credentials.passwordResetExpires": { $gt: new Date() },
  }).select("credentials");

  if (!user) return next(new AppError(400, "انتهت المدة المسموحة للرابط"));

  //STEP 2) get the new password since the link is still valid:
  const newPassword = request.body.newPassword;
  const newPasswordConfirm = request.body.newPasswordConfirm;
  if (!newPassword || !newPasswordConfirm) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));
  if (newPassword !== newPasswordConfirm) return next(new AppError(400, "كلمات المرور غير متطابقة"));

  user.credentials!.password = newPassword;
  user.credentials!.passwordResetToken = "";

  await user.save(); // still validating the new password against the schema

  response.status(200).json({
    success: true,
  });

  //STEP 3) redirect the user to the login page (handled by front-end)
});
