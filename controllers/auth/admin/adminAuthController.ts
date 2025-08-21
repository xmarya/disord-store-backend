import Admin from "@models/adminModel";
import { getOneDocById } from "@repositories/global";
import getAdminProfile from "@services/adminServices/getAdminProfile";
import updateAdmin from "@services/adminServices/updateAdmin";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import jwtSignature from "@utils/jwtToken/generateSignature";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "@utils/passwords/comparePasswords";

export const confirmAdminChangePasswordController = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const { currentPassword, newPassword } = request.body;
  const admin = await getOneDocById(Admin, adminId, { select: ["credentials"] });

  if (!admin) return next(new AppError(404, "هذا المستخدم غير موجود"));

  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(currentPassword, admin.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 4) allow changing the password:
  admin.credentials.password = newPassword;
  await admin.save();

  // STEP 5) generate a new token:
  const token = jwtSignature(adminId, "1h");
  tokenWithCookies(response, token);

  response.status(201).json({
    success: true,
  });
});

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
export const updateAdminProfileController = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const result = await updateAdmin(adminId, request.body);

  if(isErr(result)) return next(new AppError(400, result.error));

  if(!result.ok) {
    const statusCode = result.reason === "not-found" ? 404 : 500;
    return next(new AppError(statusCode, `${result.reason}: ${result.message}`));
  }

  const {result: updatedAdmin} = result;
  response.status(201).json({
    success: true,
    data: { updatedAdmin },
  });
});
