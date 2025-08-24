import getAdminProfile from "@services/adminServices/getAdminProfile";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

export const getAdminProfileController = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const result = await getAdminProfile(adminId);

  if(!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`))
  }

  const {result: adminProfile} = result;
  response.status(200).json({
    success: true,
    data: { adminProfile },
  });
});

