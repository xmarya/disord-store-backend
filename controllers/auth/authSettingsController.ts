import confirmChangedPassword from "@services/_sharedServices/confirmChangedPassword";
import updateProfile from "@services/_sharedServices/updateProfile";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";

export const confirmChangePasswordController = catchAsync(async (request, response, next) => {
  const {user}  = request;
  const { currentPassword, newPassword } = request.body;
  const result = await confirmChangedPassword({user, currentPassword, newPassword});

  if (isErr(result)) return next(new AppError(401, "هذا المستخدم غير موجود"));
  if(typeof result !== "string") return next(new AppError(500, result.message));

  const token = result;
  tokenWithCookies(response, token);

  response.status(203).json({
    success: true,
    message: "your password has been changed successfully."
  });
});

export const updateProfileController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await updateProfile(userId, request.body);

  if(isErr(result)) return next(new AppError(400, result.error));

  if(!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  const {result: updatedProfile} = result;
  response.status(201).json({
    success: true,
    data: { updatedProfile },
  });
});