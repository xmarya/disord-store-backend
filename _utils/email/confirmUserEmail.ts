import { UserTypes } from "../../_Types/User";
import { AppError } from "../AppError";
import addJob from "../bullmqOperations/jobs/addJob";
import { catchAsync } from "../catchAsync";
import { deleteRedisHash, getRedisHash } from "../redisOperations/redisHash";

const confirmUserEmail = catchAsync(async (request, response, next) => {
  const { randomToken } = request.params;
  const data: { id: string; userType: UserTypes } | null = await getRedisHash(`Email:${randomToken.slice(0, 12)}`);

  if (!data) return next(new AppError(400, "انتهت المدة المسموحة لرابط التفعيل"));

  const Model = ["user", "storeOwner"].includes(data.userType) ? "User" : "Admin";

  // delete the hash
  await deleteRedisHash(`Email:${randomToken.slice(0, 12)}`);

  // add the data as worker's job
 addJob("EmailConfirm", data.id, {Model, id:data.id, randomToken});

  response.status(203).json({
    success: true,
    message: "تم تأكيد بريدك الإلكتروني بنجاح",
  });
});

export default confirmUserEmail;
