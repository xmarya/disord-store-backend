import { updateDoc } from "../../../_services/global";
import { catchAsync } from "../../../_utils/catchAsync";
import Store from "../../../models/storeModel";
import { deleteStorePermanently } from "../storeControllers";

export const getAllStoresInfo = catchAsync(async (request, response, next) => {
  // returns the store names, logo, owners, in which plan, total profit,
});

export const getOneStoreInfo = catchAsync(async (request, response, next) => {});

export const suspendStore = catchAsync(async (request, response, next) => {
  await updateDoc(Store, request.params.storeId, {status: "suspended"});
  response.status(201).json({
    success: true,
  });
});

export const deleteStore = catchAsync(async (request, response, next) => {
  const deletedStore = deleteStorePermanently(request.params.storeId);

  response.status(204).json({
    success: true,
    deletedStore,
  });
});
