import createNewStore from "@services/auth/storeServices/createNewStore";
import getStoreForAuthorisedUser from "@services/auth/storeServices/getStoreForAuthorisedUser";
import updateStore from "@services/auth/storeServices/updateStore";
import updateStoreStatus from "@services/auth/storeServices/updateStoreStatus";
import deleteMyStore from "@services/auth/storeOwnerServices/deleteMyStore";
import { StoreDataBody, StoreDocument } from "@Types/Schema/Store";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import returnError from "@utils/returnError";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";

export const createStoreController = catchAsync(async (request, response, next) => {

  const storeOwner = request.user as StoreOwnerDocument;
  if(!storeOwner.subscribedPlanDetails.paid) return next(returnError(new Forbidden("لابد من الأشتراك في باقة لإنشاء متجر جديد")))
  // TODO: complete the store data
  const { storeName, description }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  const result = await createNewStore(storeOwner, request.body);

  if (!(result as StoreDocument)?.id) return next(result);

  response.status(201).json({
    success: true,
    data: { newStore: result },
  });
});

export const getMyStoreController = catchAsync(async (request, response, next) => {
  // const storeId = request.store;
  // const store = await getOneDocById(Store, storeId);

  const userId = request.user.id;
  const result = await getStoreForAuthorisedUser(userId);

  if (!result.ok) return next(returnError(result));

  const { result: store } = result;

  response.status(200).json({
    success: true,
    data: { store },
  });
});

export const updateMyStoreController = catchAsync(async (request, response, next) => {
  console.log("updateMyStoreController");
  // only allow storeName, description, logo
  const { storeName, description }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "request.body must contain the storeName description"));

  const result = await updateStore(request.store, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: updatedStore } = result;
  response.status(201).json({
    success: true,
    data: { updatedStore },
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
    data: { updatedStore },
  });
});

export const deleteMyStoreController = catchAsync(async (request, response, next) => {
  const storeId = request.store;

  await deleteMyStore(storeId);

  response.status(204).json({
    success: true,
    message: "the store and all its related resources are deleted.",
  });
});
