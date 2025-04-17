import { StoreDataBody, StoreDocument } from './../../_Types/Store';
import { createStore, getStoreWithProducts } from "../../_services/store/storeService";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import { deleteOne, getOne, updateOne } from "../global";
import { deleteDoc, getOneDoc, updateDoc } from '../../_services/global';
import Store from '../../models/storeModel';
import { getDynamicModel, isDynamicModelExist } from '../../_utils/dynamicMongoModel';
import { ProductDocument } from '../../_Types/Product';

export const createStoreController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);
  
  const owner = request.user.id;
  if (!owner) return next(new AppError(400, "Couldn't find the request.user.id"));

  const {storeName, description, logo}:StoreDataBody = request.body;
  if(!storeName.trim() || !description.trim()) return next(new AppError(400, "الرجاء تعبئة جميع الحقول"));

  //TODO: handling logo and uploading it to cloudflare
  const data = { ...request.body, owner };
  const newStore = await createStore(data);

  response.status(201).json({
    success: true,
    newStore,
  });
});

export const getMyStoreNewController = catchAsync( async(request, response, next) => {
  const {storeId}:StoreDataBody = request.body;
  if(!storeId) return next(new AppError(400, "storeId is missing from the request.body"));

  const myStore = await getOneDoc<StoreDocument>(Store, storeId);
  if(!myStore) return next(new AppError(500,"Something went wrong while fetching the data. Please try again."));

  response.status(200).json({
    success: true,
    myStore
  });

});

export const getStoreWithProductsController = catchAsync( async(request, response, next) => {
  //STEP 1) first, check if the store has any products:
  const {storeId} = request.params;
  const ProductModel = await getDynamicModel<ProductDocument>("Product", storeId, false); // false = don't create a new DyMo it it doesn't exist
  console.log("getStoreWithProductsController'sProductModel =", ProductModel);
  if(!ProductModel) return next(new AppError(404, "no products were found related to this storeId"));

  const {store, products} = await getStoreWithProducts(storeId, ProductModel);

  response.status(200).json({
    success: true,
    store,
    products
  });
});

export const updateStoreNewController = catchAsync( async(request, response, next) => {
  // only allow storeName, description, logo
  const {storeName, description, logo}:StoreDataBody = request.body;
  if(!storeName.trim() && !description.trim() && logo) return next(new AppError(400, "request.body has no data to update"));

  // (this validation was done on the front-end already) validate the storeName -if it is there- using getField utility function
  const storeId = request.user.myStore;
  if(!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  const data = {storeName, description, logo}
  const updatedStore = await updateDoc(Store, storeId, data);

  response.status(201).json({
    success: true,
    updatedStore
  });
});

export const deleteStoreNewController = catchAsync( async(request, response, next) => {
 
  const storeId = request.user.myStore;
  if(!storeId) return next(new AppError(400, "Couldn't find request.user.myStore"));
  const deletedStore = await deleteDoc(Store, storeId);

  response.status(204).json({
    success: true,
    deletedStore
  });
});

// NOTE: OLD CODE. DELETE THEM LATER.
export const getMyStoreController = getOne("Store");
export const updateStoreController = updateOne("Store");
export const deleteStoreController = deleteOne("Store");
