import { catchAsync } from "@utils/catchAsync";
import resetUserPassword from "@services/nonAuth/credentialsServices/passwords/resetUserPassword";
import returnError from "@utils/returnError";

export const resetPassword = catchAsync(async (request, response, next) => {
  const result = await resetUserPassword(request.params.randomToken, request.body.newPassword, request.body.newPasswordConfirm);

  if(!result.ok) return next(returnError(result));

  response.status(200).json({
    success: true,
    message: "تم تحديث كلمة المرور بنجاح"
  });
});
