import confirmChangedPassword from "@services/_sharedServices/confirmChangedPassword";
import updateProfile from "@services/_sharedServices/updateProfile";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import returnError from "@utils/returnError";

export const confirmChangePasswordController = catchAsync(async (request, response, next) => {
  const { currentPassword, newPassword } = request.body;
  const {id, email} = request.user;
  const result = await confirmChangedPassword({currentPassword, newPassword, email, userId:id});

  if (!result.ok) return next(returnError(result))


  const {result: token} = result;
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

  if (!result.ok) return next(returnError(result));

  const {result: updatedProfile} = result;
  response.status(201).json({
    success: true,
    data: { updatedProfile },
  });
});