import { getOneDocById } from "../_services/global";
import Admin from "../models/adminModel";
import User from "../models/userModel";
import { AppError } from "../_utils/AppError";
import { catchAsync } from "../_utils/catchAsync";
import generateEmailConfirmationToken from "../_utils/email/generateEmailConfirmationToken";

export const sendConfirmationEmail = catchAsync(async (request, response, next) => {
  const { userType } = request.user;
  const query = ["user", "storeOwner"].includes(userType)
    ? getOneDocById(User, request.user.id, { select: ["credentials", "userType"] })
    : getOneDocById(Admin, request.user.id, { select: ["credentials", "userType"] });

  const user = await query;

  if (!user) return next(new AppError(500, "حدثت مشكلة. الرجاء المحاولة مرة أخرى"));

  const confirmUrl = await generateEmailConfirmationToken(user, request);

  response.status(200).json({
    success: true,
    confirmUrl,
  });
});
