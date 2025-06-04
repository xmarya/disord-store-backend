import { getOneDocById } from "../../_services/global";
import { AdminDocument } from "../../_Types/admin/AdminUser";
import { UserDocument } from "../../_Types/User";
import Admin from "../../models/adminModel";
import User from "../../models/userModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { jwtVerify } from "../jwtToken/jwtVerify";

const getUserFromPayload = catchAsync(async (request, response, next) => {
  let user;

  // STEP 2) validate the token:
  const payload = await jwtVerify(request.token, process.env.JWT_SALT!);

  user = await getOneDocById(User, payload.id);
  if (!user) {
    user = await getOneDocById(Admin, payload.id);
    if (!user) return next(new AppError(401, "حدثت مشكلة. الرجاء تسجيل الدخول"));
  }

  request.user = user; /*REQUIRES TESTING*/
  console.log("after protecting");
  console.log(request.user.id, request.user.userType);

  next();
});

export default getUserFromPayload;
