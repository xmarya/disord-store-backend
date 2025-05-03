import mongoose, { startSession } from "mongoose";
import { getOneDoc, updateDoc } from "../../_services/global";
import { createStore, deleteStore, getStoreWithProducts } from "../../_services/store/storeService";
import { ProductDocument } from "../../_Types/Product";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel } from "../../_utils/dynamicMongoModel";
import sanitisedData from "../../_utils/sanitisedData";
import Store from "../../models/storeModel";
import { StoreDataBody, StoreDocument } from "./../../_Types/Store";
import { deleteProductsCollectionController } from "./productNewController";
import { resetStoreOwnerToDefault } from "../../_services/user/userService";
import { deleteAllAssistants } from "../../_services/assistant/assistantService";
import { deleteCategoriesCollectionController } from "./categoryController";

export const createStoreController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  const owner = request.user.id;
  if (!owner) return next(new AppError(400, "Couldn't find the request.user.id"));

  const { storeName, description, logo }: StoreDataBody = request.body;
  if (!storeName?.trim() || !description?.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  //TODO: handling logo and uploading it to cloudflare
  const data = { ...request.body, owner, inPlan: request.user.planName };
  const newStore = await createStore(data);

  response.status(201).json({
    success: true,
    newStore,
  });
});

export const getMyStoreNewController = catchAsync(async (request, response, next) => {
  // const {storeId}:StoreDataBody = request.body;
  // if(!storeId) return next(new AppError(400, "storeId is missing from the request.body"));

  const myStore = await getOneDoc<StoreDocument>(Store, request.user.myStore!);
  if (!myStore) return next(new AppError(500, "Something went wrong while fetching the data. Please try again."));

  response.status(200).json({
    success: true,
    myStore,
  });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {
  //STEP 1) first, check if the store has any products:
  const { storeId } = request.params;
  const ProductModel = await getDynamicModel<ProductDocument>("Product", storeId); // false = don't create a new DyMo it it doesn't exist
  console.log("getStoreWithProductsController'sProductModel =", ProductModel);
  // if(!ProductModel) return next(new AppError(404, "no products were found related to this storeId"));

  const { store, products } = await getStoreWithProducts(storeId, ProductModel);

  response.status(200).json({
    success: true,
    store,
    products,
  });
});

export const updateMyStoreNewController = catchAsync(async (request, response, next) => {
  // only allow storeName, description, logo
  const { storeName, description, logo }: StoreDataBody = request.body;
  if (!storeName?.trim() && !description?.trim() && logo) return next(new AppError(400, "request.body has no data to update"));

  // (this validation was done on the front-end already) validate the storeName -if it is there- using getField utility function
  const storeId = request.user.myStore;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  const data = { storeName, description, logo };
  const updatedStore = await updateDoc(Store, storeId, data);

  response.status(201).json({
    success: true,
    updatedStore,
  });
});

export const updateMyStoreStatus = catchAsync(async (request, response, next) => {
  const storeId = request.user.myStore;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));

  const {status} = request.body;
  if(!status?.trim()) return next(new AppError(400, "please provide a status"));
  
  const allowedStatuses = ["active", "maintenance", "suspended"];
  if(!allowedStatuses.includes(status)) return next(new AppError(400, "the status must be one of active or maintenance or suspended"));

  const updatedStore = await updateDoc<StoreDocument>(Store, storeId, {status});

  response.status(201).json({
    success: true,
    updatedStore
  });

});

export const deleteMyStoreNewController = catchAsync(async (request, response, next) => {
  const storeId = request.user.myStore;
  if (!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  await deleteStorePermanently(storeId);

  response.status(204).json({
    success: true,
  });
});

export async function deleteStorePermanently(storeId:string | mongoose.Types.ObjectId) {
  const session = await startSession();

  try {
    session.startTransaction();
    //STEP 1) change userType and remove myStore:
    await resetStoreOwnerToDefault(storeId, session);
    //STEP 2) delete corresponding storeAssistant:
    await deleteAllAssistants(storeId, session);
    //STEP 3) delete the store:
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

  // if the deletion of the store went successfully, drop the collection (this functionality doesn't fully support session and transaction)
  await deleteProductsCollectionController(storeId);
  await deleteCategoriesCollectionController(storeId);
}
