import mongoose, { startSession } from "mongoose";
import { deleteAllAssistants } from "../../_services/assistant/assistantService";
import { updateDoc } from "../../_services/global";
import { createStore, deleteStore, getStoreWithProducts } from "../../_services/store/storeService";
import { resetStoreOwnerToDefault } from "../../_services/user/userService";
import { MongoId } from "../../_Types/MongoId";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Store from "../../models/storeModel";
import { StoreDataBody, StoreDocument } from "./../../_Types/Store";
import { deleteAllProducts } from "../../_services/product/productServices";
import { deleteAllCategories } from "../../_services/category/categoryService";
import { deleteAllResourceReviews } from "../../_services/review/reviewService";
import { removeRanking } from "../../_services/ranking/rankingService";
import { StoreOwner } from "../../_Types/User";

export const createStoreController = catchAsync(async (request, response, next) => {
  // TODO: complete the store data
  const { storeName, description, logo }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  //TODO: handling logo and uploading it to cloudflare
  const data: StoreDataBody = { storeName, description, logo, owner: request.user.id, inPlan: (request.user as StoreOwner).subscribedPlanDetails.planName };
  const newStore = await createStore(data);

  response.status(201).json({
    success: true,
    newStore,
  });
});


export const updateMyStoreController = catchAsync(async (request, response, next) => {
  // only allow storeName, description, logo
  const { storeName, description }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "request.body has no data to update"));

  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));

  // I'm only checking the main fields to make sure they are exist, and assigning the whole body for other fields in case the user updates them.
  const updatedStore = await updateDoc(Store, storeId, request.body);

  response.status(201).json({
    success: true,
    updatedStore,
  });
});

export const updateMyStoreStatus = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));

  const { status } = request.body;
  if (!status?.trim()) return next(new AppError(400, "please provide a status"));

  const allowedStatuses = ["active", "maintenance"];
  if (!allowedStatuses.includes(status)) return next(new AppError(400, "the status must be one of active or maintenance"));

  const updatedStore = await updateDoc<StoreDocument>(Store, storeId, { status });

  response.status(201).json({
    success: true,
    updatedStore,
  });
});

export const deleteMyStoreController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  await deleteStorePermanently(storeId);

  response.status(204).json({
    success: true,
    message: "the store and all its related resources are deleted.",
  });
});

export async function deleteStorePermanently(storeId: MongoId, session?: mongoose.ClientSession | null) {
  if (!session) session = await startSession();

  await session.withTransaction(async () => {
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
    //STEP:6) delete the rank:
    await removeRanking(storeId, session);
    /*TODO: what about all of the store's products' reviews? should I write a post(deleteMany) hook and call the ranking service from??*/
    //STEP 7) delete the store:
    await deleteStore(storeId, session);
    console.log("test request.user.myStore before deletion the store", storeId);
  });
  await session.endSession();

  /* OLD CODE (kept for reference): 
  // if the deletion of the store went successfully, drop the collection (this functionality doesn't fully support session and transaction)
  await deleteProductsCollectionController(storeId);
  await deleteCategoriesCollectionController(storeId);
  */

  //TODO: add the deleted data to the AdminLog
}

export const previewStoreWithProducts = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  const { store, products } = await getStoreWithProducts(storeId);

  response.status(200).json({
    success: true,
    store,
    products,
  });
});
