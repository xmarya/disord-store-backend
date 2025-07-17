import { getOneDocByFindOne, getOneDocById, updateDoc } from "../../../_services/global";
import { AppError } from "../../../_utils/AppError";
import cacheUser from "../../../_utils/cacheControllers/user";
import { catchAsync } from "../../../_utils/catchAsync";
import jwtSignature from "../../../_utils/jwtToken/generateSignature";
import tokenWithCookies from "../../../_utils/jwtToken/tokenWithCookies";
import { comparePasswords } from "../../../_utils/passwords/comparePasswords";
import Admin from "../../../models/adminModel";

export const adminLoginController = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  if (!email?.trim() || !password?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول المطلوبة"));

  const admin = await getOneDocByFindOne(Admin, { condition: { email } });
  if (!admin) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  console.log("adminLoginController", admin);
  if (!(await comparePasswords(password, admin.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

  //STEP 3) create the token:
  const token = jwtSignature(admin.id, "1h");
  tokenWithCookies(response, token);

  cacheUser(admin);
  response.status(200).json({
    success: true,
    // token,
  });
});

export const confirmAdminChangePassword = catchAsync(async (request, response, next) => {

  const adminId = request.user.id;
  const { currentPassword, newPassword } = request.body;
  const admin = await getOneDocById(Admin, adminId, {select: ["credentials"]});

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

export const getAdminProfile = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const adminProfile = await getOneDocById(Admin, adminId, { select: ["firstName", "lastName", "email", "image"] });

  if (!adminProfile) return next(new AppError(400, "لم يتم العثور على بيانات المستخدم"));

  response.status(200).json({
    success: true,
    adminProfile,
  });
});
export const updateAdminProfile = catchAsync(async (request, response, next) => {
  const adminId = request.user.id;
  const { email, firstName, lastName } = request.body;

  if (email) {
    const isEmailExist = await getOneDocByFindOne(Admin, { condition: { email } }); /*✅*/
    console.log("isEmailExist", isEmailExist);
    if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني"));
  }

  if (firstName?.trim() === "" && lastName?.trim() === "") return next(new AppError(400, "الرجاء تعبئة حقول الاسم بالكامل"));

  const updatedAdmin = await updateDoc(Admin, adminId, request.body)
  
  response.status(201).json({
    success: true,
    updatedAdmin,
  });
});