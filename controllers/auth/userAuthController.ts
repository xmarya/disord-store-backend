import deleteUser from "@services/auth/usersServices/deleteUser";
import getUserProfile from "@services/auth/usersServices/getUserProfile";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import type { Request, Response } from "express";
import { deleteFromCache } from "../../externals/redis/cacheControllers/globalCache";
import { deleteRedisHash } from "../../externals/redis/redisOperations/redisHash";

export const getUserProfileController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await getUserProfile(userId);

  if (!result.ok) return next(returnError(result));
  const { result: userProfile } = result;

  response.status(200).json({
    success: true,
    data: { userProfile },
  });
});


// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const result = await deleteUser(userId);

  if (result.isErr()) return next(new AppError(400, result.error));

  response.status(204).json({
    success: true,
    message: result.value,
  });
});

export function logout(request: Request, response: Response) {
  deleteFromCache(`User:${request.user.id}`);
  request.user.userType === "storeOwner" && deleteRedisHash(`StoreAndPlan:${request.user.myStore}`);
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
