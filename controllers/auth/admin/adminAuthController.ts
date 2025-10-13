import getAdminProfile from "@services/auth/adminServices/adminAuth/getAdminProfile";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const getAdminProfileController = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const result = await getAdminProfile(adminId);

  if (!result.ok) return next(returnError(result));

  const { result: adminProfile } = result;
  response.status(200).json({
    success: true,
    data: adminProfile
  });
});
