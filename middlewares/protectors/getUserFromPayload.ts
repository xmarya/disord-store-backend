import { getOneDocById } from "../../_services/global";
import { AdminDocument } from "../../_Types/admin/AdminUser";
import { MongoId } from "../../_Types/MongoId";
import { UserDocument } from "../../_Types/User";
import Admin from "../../models/adminModel";
import User from "../../models/userModel";
import { AppError } from "../../_utils/AppError";
import { getDecompressedCacheData } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "../../_utils/catchAsync";
import jwtVerify from "../../_utils/jwtToken/jwtVerify";

const getUserFromPayload = catchAsync(async (request, response, next) => {
  let user: UserDocument | AdminDocument | null;

  // STEP 2) validate the token:
  const payload = await jwtVerify(request.token, process.env.JWT_SALT!);

  user = (await getDecompressedCacheData(`User:${payload.id}`)) || (await getUserFromDB(payload.id));
  if (!user) return next(new AppError(401, "حدثت مشكلة. الرجاء تسجيل الدخول"));

  request.user = user;
  next();
});

async function getUserFromDB(id: MongoId) {
  let user: UserDocument | AdminDocument | null;
  user = await getOneDocById(User, id);
  if (!user) user = await getOneDocById(Admin, id);

  return user;
}

export default getUserFromPayload;
