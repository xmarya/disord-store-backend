import confirmChangedPassword from "@services/_sharedServices/confirmChangedPassword";
import updateProfile from "@services/_sharedServices/updateProfileFactory";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import { catchAsync } from "@utils/catchAsync";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import returnError from "@utils/returnError";

export const confirmChangePasswordController = catchAsync(async (request, response, next) => {
  const { currentPassword, newPassword } = request.body;
  const { id, email } = request.user;
  const result = await confirmChangedPassword({ providedPassword: currentPassword, newPassword, email, userId: id });

  if (!result.ok) return next(returnError(result));

  const { result: token } = result;
  tokenWithCookies(response, token);

  response.status(203).json({
    success: true,
    message: "تم تغيير كلمة المرور بنجاح",
  });
});

export const updateProfileController = catchAsync(async (request, response, next) => {
  const user = request.user;
  const result = await updateProfile(user as NotAssistant, request.body);

  if (!result.ok) return next(returnError(result));

  const { result: updatedProfile } = result;
  response.status(201).json({
    success: true,
    data: { updatedProfile },
  });
});
