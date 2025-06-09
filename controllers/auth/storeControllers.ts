import { startSession } from "mongoose";
import { deleteAllAssistants } from "../../_services/assistant/assistantService";
import { updateDoc } from "../../_services/global";
import { createStore, deleteStore } from "../../_services/store/storeService";
import { getOneStoreStats } from "../../_services/store/storeStatsService";
import { resetStoreOwnerToDefault } from "../../_services/user/userService";
import { MongoId } from "../../_Types/MongoId";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Store from "../../models/storeModel";
import { StoreDataBody, StoreDocument } from "./../../_Types/Store";

export const createStoreController = catchAsync(async (request, response, next) => {
  // TODO: complete the store data
  const { storeName, description, logo }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  //TODO: handling logo and uploading it to cloudflare
  const data: StoreDataBody = { storeName, description, logo, owner: request.user.id, inPlan: request.plan };
  const newStore = await createStore(data);

  response.status(201).json({
    success: true,
    newStore,
  });
});

export const getStoreStatsController = catchAsync(async (request, response, next) => {
  /* BUG: 
  const { dates } = request.body;
    this condition WOULD NEVER be wrong, the .length property doesn't assure that the dates is an ARRAY,
    there is a possibility for it be a string and it has .length property too.
    if(!dates.length) return next(new AppError(400, "specify the dates inside an array"));
  */

  const { dateFilter, sortBy, sortOrder } = request.dateQuery;
  const storeId = request.store;

  const stats = await getOneStoreStats(storeId, dateFilter, sortBy, sortOrder);
  if (!stats) return next(new AppError(400, "no stats were found for this store"));

  response.status(200).json({
    success: true,
    stats,
  });
});

export const updateMyStoreNewController = catchAsync(async (request, response, next) => {
  // only allow storeName, description, logo
  const { storeName, description, logo }: StoreDataBody = request.body;
  if (!storeName?.trim() && !description?.trim() && logo) return next(new AppError(400, "request.body has no data to update"));

  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  const data = { storeName, description, logo };
  const updatedStore = await updateDoc(Store, storeId, data);

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

export const deleteMyStoreNewController = catchAsync(async (request, response, next) => {
  const storeId = request.store;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  await deleteStorePermanently(storeId);

  /*TODO:
  await Ranking.deleteOne(deletedDoc.id);
  console.log("now check Ranking after delete");
  await Review.deleteMany({ reviewedModel: deletedDoc.id})
  */
  response.status(204).json({
    success: true,
  });
});

export async function deleteStorePermanently(storeId: MongoId) {
  const session = await startSession();

  try {
    session.startTransaction();
    //STEP 1) change userType and remove myStore:
    await resetStoreOwnerToDefault(storeId, session);
    //STEP 2) delete corresponding storeAssistant:
    await deleteAllAssistants(storeId, session);
    //TODO:3) delete products:
    //TODO:4) delete categories:
    //STEP 5) delete the store:
    await deleteStore(storeId, session);
    console.log("test request.user.myStore before deletion the store", storeId);

    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    throw new AppError(500, "something went wrong, Please try again.");
  } finally {
    await session.endSession();
  }

  /* OLD CODE (kept for reference): 
  // if the deletion of the store went successfully, drop the collection (this functionality doesn't fully support session and transaction)
  await deleteProductsCollectionController(storeId);
  await deleteCategoriesCollectionController(storeId);
  */

  //TODO: add the deleted data to the AdminLog
}
