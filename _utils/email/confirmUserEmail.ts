import crypto from "crypto";
import mongoose from "mongoose";
import { updateDoc } from "../../_services/global";
import { AdminDocument } from "../../_Types/admin/AdminUser";
import { UserDocument, UserTypes } from "../../_Types/User";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { getHash } from "../redisOperations/redisHash";

const confirmUserEmail = catchAsync(async (request, response, next) => {
  const { randomToken } = request.params;
  const data: { id: string; userType: UserTypes } | null = await getHash(`Email:${randomToken.slice(0, 12)}`);

  if (!data) return next(new AppError(400, "انتهت المدة المسموحة لرابط التفعيل"));

  const Model = ["user", "storeOwner"].includes(data.userType) ? "User" : "Admin";

  const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");

  let user: UserDocument | AdminDocument = await mongoose
    .model(Model)
    .findOne({
      id: data.id,
      "credentials.emailConfirmationToken": hashedToken,
      "credentials.emailConfirmationExpires": { $gt: new Date() },
    })
    .select("credentials");

  if (!user) return next(new AppError(400, "انتهت المدة المسموحة لرابط التفعيل"));

  user = await updateDoc(mongoose.model(Model), data.id, {
    $unset: {
      "credentials.emailConfirmationToken": "",
      "credentials.emailConfirmationExpires": "",
    },
    "credentials.emailConfirmed": true,
  });

  response.status(203).json({
    success: true,
    message: "تم تأكيد بريدك الإلكتروني بنجاح",
  });
});

export default confirmUserEmail;
