import mongoose, { startSession } from "mongoose";
import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import { deleteAllCategories } from "@repositories/category/categoryRepo";
import { getOneDocById, updateDoc } from "@repositories/global";
import { deleteAllProducts } from "@repositories/product/productRepo";
import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { deleteStore } from "@repositories/store/storeRepo";
import { resetStoreOwnerToDefault } from "@repositories/user/userRepo";
import { MongoId } from "@Types/MongoId";
import { StoreOwner, UserDocument } from "@Types/User";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import Store from "@models/storeModel";
import { StoreDataBody, StoreDocument } from "@Types/Store";
import { deleteStoreStats } from "@repositories/store/storeStatsRepo";
import createNewStore from "@services/storeServices/createNewStore";
import returnError from "@utils/returnError";
import updateStore from "@services/storeServices/updateStore";
import getStoreForAuthorisedUser from "@services/storeServices/getStoreForAuthorisedUser";

export const createStoreController = catchAsync(async (request, response, next) => {
  // TODO: complete the store data
  const { storeName, description }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  const result = await createNewStore(request.user as UserDocument, request.body);

  if(!(result as StoreDocument)?.id) return next(result);


  response.status(201).json({
    success: true,
    data: { newStore:result },
  });
});


export const getMyStoreController = catchAsync(async (request, response, next) => {
  // const storeId = request.store;
  // const store = await getOneDocById(Store, storeId);

  const userId = request.user.id;
  const result = await getStoreForAuthorisedUser(userId);

  if(!result.ok) return next(returnError(result));

  const {result:store} = result;

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

  const allowedStatuses = ["active", "maintenance"];
  if (!allowedStatuses.includes(status)) return next(new AppError(400, "the status must be active or maintenance"));

  const updatedStore = await updateDoc<StoreDocument>(Store, storeId, { status });

  response.status(201).json({
    success: true,
    data: { updatedStore },
  });
});

export const deleteMyStoreController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  const session = await startSession();
  await session.withTransaction(async () => {
    await deleteStorePermanently(storeId, session);
  });

  await session.endSession();

  response.status(204).json({
    success: true,
    message: "the store and all its related resources are deleted.",
  });
});

export async function deleteStorePermanently(storeId: MongoId, session: mongoose.ClientSession) {
  // NOTE: this function MUST run within a transaction
  //STEP 1) change userType and remove myStore:
  await resetStoreOwnerToDefault(storeId, session);
  //STEP 2) delete corresponding storeAssistant:
  await deleteAllAssistants(storeId, session);
  //STEP:3) delete products:
  await deleteAllProducts(storeId, session);
  //STEP:4) delete categories:
  await deleteAllCategories(storeId, session);
  //STEP:5) delete reviews:
  await deleteAllResourceReviews(storeId, session);
  //STEP:5) delete stats records:
  await deleteStoreStats(storeId, session);

  /*TODO: what about all of the store's products' reviews? should I write a post(deleteMany) hook and call the ranking service from??*/
  //STEP 7) delete the store:
  await deleteStore(storeId, session);

  //TODO: add the deleted data to the AdminLog
}
