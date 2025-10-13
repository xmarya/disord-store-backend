import getProfileFactory from "@services/_sharedServices/getUserProfileFactory";
import deleteRegularUserAccount from "@services/auth/usersServices/deleteRegularUserAccount";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import type { Request, Response } from "express";
import { deleteRedisHash } from "../../externals/redis/redisOperations/redisHash";
import deleteUserFromCache from "@externals/redis/cacheControllers/deleteUserFromCache";
import deleteStoreOwnerAccount from "@services/auth/storeOwnerServices/deleteStoreOwnerAccount";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";

export const getUserProfileController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await getProfileFactory(userId, request.user.userType);

  if (!result.ok) return next(returnError(result));
  const { result: userProfile } = result;

  response.status(200).json({
    success: true,
    data: userProfile
  });
});

// TODO: bank account controller, it's separate because it needs card data validation

export const deleteUserAccountController = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const result = await deleteRegularUserAccount(userId);

  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "تم حذف المستخدم بنجاح",
  });
});

export const deleteStoreOwnerAccountController = catchAsync(async (request, response, next) => {
  const { storeOwnerId } = request.params;

  const storeId = (request.user as StoreOwnerDocument)?.myStore ?? undefined;
  const result = await deleteStoreOwnerAccount({storeOwnerId, storeId});

  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "تم حذف المستخدم بنجاح",
  });
});

export function logout(request: Request, response: Response) {
  // TODO create service that deletes the cache
  // deleteUserFromCache(`User:${request.user.id}`);

  request.user.userType === "storeOwner" && deleteRedisHash(`StoreAndPlan:${request.user.myStore}`);
  response.clearCookie("jwt");
  response.setHeader("Clear-Site-Data", "cookies"); // for browsers
  response.status(200).json({ success: true, message: "you've logged-out" });
}
