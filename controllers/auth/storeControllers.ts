import createNewStore from "@services/auth/storeServices/createNewStore";
import updateStore from "@services/auth/storeServices/updateStore";
import updateStoreStatus from "@services/auth/storeServices/updateStoreStatus";
import deleteMyStore from "@services/auth/storeOwnerServices/deleteMyStore";
import { StoreDataBody } from "@Types/Schema/Store";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import returnError from "@utils/returnError";
import getStoreOf from "@services/auth/storeServices/getStoreOf";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import getStoreSettings from "@services/auth/storeServices/storeSettings/getStoreSettings";
import updateStoreSettings from "@services/auth/storeServices/storeSettings/updateStoreSettings";

export const createStoreController = catchAsync(async (request, response, next) => {
  const storeOwner = request.user as StoreOwnerDocument;

  const { storeName, description, productsType }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim() || !productsType?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول");

  const result = await createNewStore(storeOwner, request.body);

  if (!result.ok) return next(returnError(result));

  const { result: newStore } = result;

  response.status(201).json({
    success: true,
    data: newStore,
  });
});

export const getMyStoreController = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const result = await getStoreOf(userId);

  if (!result.ok) return next(returnError(result));

  const { result: store } = result;

  response.status(200).json({
    success: true,
    data: store,
  });
});

export const updateMyStoreController = catchAsync(async (request, response, next) => {
  const result = await updateStore(request.store, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: updatedStore } = result;
  response.status(201).json({
    success: true,
    data: updatedStore,
  });
});

export const updateMyStoreStatus = catchAsync(async (request, response, next) => {
  const storeId = request.store;

  const { status } = request.body;
  if (!status?.trim()) return next(new AppError(400, "please provide a status"));

  const result = await updateStoreStatus(storeId, status);

  if (isErr(result)) return next(returnError({ reason: "bad-request", message: result.error }));

  if (!result.ok) return next(returnError(result));

  const { result: updatedStore } = result;

  response.status(201).json({
    success: true,
    data: updatedStore,
  });
});

export const getStoreSettingsController = catchAsync(async (request, response, next) => {
  const result = await getStoreSettings(request.store);
  if (!result.ok) return next(returnError(result));

  response.status(200).json({
    success: true,
    data: result.result,
  });
});

export const updateStoreSettingsController = catchAsync(async (request, response, next) => {
  const result = await updateStoreSettings(request.store, request.body);
  if (!result.ok) return next(returnError(result));

  response.status(203).json({
    success: true,
    data: result.result,
  });
});

export const deleteMyStoreController = catchAsync(async (request, response, next) => {
  const storeId = request.store;

  const result = await deleteMyStore(storeId);
  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: "the store and all its related resources are deleted.",
  });
});
