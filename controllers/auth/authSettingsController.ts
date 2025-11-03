import updateProfile from "@services/_sharedServices/updateProfile";
import confirmChangedEmail from "@services/auth/credentials/confirmChangedEmail";
import confirmChangedPassword from "@services/auth/credentials/confirmChangedPassword";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import { catchAsync } from "@utils/catchAsync";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import returnError from "@utils/returnError";

export const changePasswordController = catchAsync(async (request, response, next) => {
  const { currentPassword, newPassword } = request.body;
  const { id, email, userType } = request.user;
  const result = await confirmChangedPassword({userType, providedPassword: currentPassword, newPassword, email, userId: id });

  if (!result.ok) return next(returnError(result));

  const { result: token } = result;
  tokenWithCookies(response, token);

  response.status(203).json({
    success: true,
    message: "تم تغيير كلمة المرور بنجاح",
  });
});

export const changeEmailController = catchAsync(async (request, response, next) => {
  const result = await confirmChangedEmail(request.body.newEmail, request.user as NotAssistant);
  if (!result.ok) return next(returnError(result));

  response.status(203).json({
    success: true,
    message: "تم تغيير البريد الإلكتروني بنجاح",
  });
  
});

export const updateProfileController = catchAsync(async (request, response, next) => {
  const {user} = request;
  const result = await updateProfile(user as NotAssistant, request.body, request.emailConfirmed);

  if (!result.ok) return next(returnError(result));

  const { result: updatedProfile } = result;
  response.status(201).json({
    success: true,
    data: updatedProfile,
  });
});
