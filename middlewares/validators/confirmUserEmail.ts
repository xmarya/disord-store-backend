import { UserTypes } from "@Types/User";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import addJob from "../../externals/bullmq/addJob";
import { deleteRedisHash, getRedisHash } from "../../externals/redis/redisOperations/redisHash";
import { TokenSlicer } from "@constants/dataStructures";

const confirmUserEmail = catchAsync(async (request, response, next) => {
  console.log("confirmUserEmail");
  const { randomToken } = request.params;

  const slicedToken = randomToken.slice(TokenSlicer.from, TokenSlicer.to);
  const data: { id: string; userType: UserTypes } | null = await getRedisHash(`Email:${slicedToken}`);

  if (!data) return next(new AppError(400, "انتهت المدة المسموحة لرابط التفعيل"));

  const Model = ["user", "storeOwner"].includes(data.userType) ? "User" : "Admin";

  // delete the hash
  await deleteRedisHash(`Email:${slicedToken}`);

  // add the data as worker's job
  addJob("EmailConfirm", data.id, { Model, id: data.id, randomToken });

  response.status(203).json({
    success: true,
    message: "تم تأكيد بريدك الإلكتروني بنجاح",
  });
});

export default confirmUserEmail;
