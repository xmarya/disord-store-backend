import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import Admin from "@models/adminModel";
import User from "@models/userModel";
import { AppError } from "@utils/AppError";
import { getDecompressedCacheData } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "@utils/catchAsync";
import jwtVerify from "@utils/jwtToken/jwtVerify";

const getUserFromPayload = catchAsync(async (request, response, next) => {
  let user;

  // STEP 2) validate the token:
  const payload = await jwtVerify(request.token, process.env.JWT_SALT!);

  user = (await getDecompressedCacheData(`User:${payload.id}`)) || (await getUserFromDB(payload.id));
  if (!user) return next(new AppError(401, "حدثت مشكلة. الرجاء تسجيل الدخول"));

  request.user = user;
  next();
});

async function getUserFromDB(id: MongoId) {
  let user;
  user = await getOneDocById(User, id);
  if (!user) user = await getOneDocById(Admin, id);

  return user;
}

export default getUserFromPayload;
