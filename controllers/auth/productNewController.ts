import mongoose from "mongoose";
import lruCache from "../../_config/LRUCache";
import { createDoc, deleteDoc, getAllDocs, getOneDoc, updateDoc } from "../../_services/global";
import { deleteProductsCollection } from "../../_services/product/productServices";
import { ProductBasic } from "../../_Types/Product";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel, isDynamicModelExist } from "../../_utils/dynamicMongoModel";
import sanitisedData from "../../_utils/sanitisedData";

export const createProductNewController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  const {name, description, price, image, stock }:ProductBasic = request.body;
  if(!name?.trim() || !price || !description?.trim() || !stock ) return next(new AppError(400, "Please add all the product's necessary data"));
  
  // const storeId = request.user.myStore; // the storeId is also within the request.store (refer to isStoreIdExist middleware). but this middleware might be deleted in the future refactoring
  // console.log("Mystore", storeId);
  const newProd = await createDoc(request.Model, request.body);

  response.status(201).json({
    success: true,
    newProd,
  });
});

export const getAllProductsNewController = catchAsync(async (request, response, next) => {

  const products = await getAllDocs(request.Model);
  if (!products) return next(new AppError(400, "لا يوجد منتجات في هذا المتجر"));

  response.status(200).json({
    success: true,
    products,
  });
});

export const getOneProductNewController = catchAsync(async (request, response, next) => {
   const product = await getOneDoc(request.Model, request.params.productId);
  if (!product) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    product,
  });
});


export const updateProductNewController = catchAsync(async (request, response, next) =>{
  const {name, description, price, stock }:ProductBasic = request.body;
  if(!name?.trim() && !price && !description?.trim() && !stock) return next(new AppError(400, "no data was provided in the request.body"));
  
    const updatedProduct = await updateDoc(request.Model, request.params.productId, request.body);
    if(!updatedProduct) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

    response.status(201).json({
      success: true,
      updatedProduct
    });
});

export const deleteProductNewController = catchAsync(async (request, response, next) =>{
    const deletedProduct = await deleteDoc(request.Model, request.params.productId);
    response.status(204).json({
      success: true,
      deletedProduct
    });
});

export async function deleteProductsCollectionController(storeId:string | mongoose.Types.ObjectId) {
  console.log("storeId for delete", storeId);
  // STEP 1) stringify the Object.id:
  const stringifiedId = JSON.parse(JSON.stringify(storeId));

  // STEP 2) check if the DyMo is existing before deletion:
  const isExist = await isDynamicModelExist(`Product-${stringifiedId}`);
  console.log("isexist", isExist);
  if(!isExist) return;
  console.log("did it return??");
  await deleteProductsCollection(`products-${stringifiedId}`); 
  lruCache.delete(`Product-${stringifiedId}`);
  console.log("test lru", lruCache.get(`Product-${stringifiedId}`));
}