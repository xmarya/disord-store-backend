import mongoose from "mongoose";
import lruCache from "../../_config/LRUCache";
import { createDoc, deleteMongoCollection, getAllDocs, getOneDoc } from "../../_services/global";
import { CategoryBasic, CategoryDocument } from "../../_Types/Category";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { getDynamicModel, isDynamicModelExist } from "../../_utils/dynamicMongoModel";
import sanitisedData from "../../_utils/sanitisedData";
import { assignProductToCategory, deleteProductFromCategory } from "../../_services/category/categoryService";

// protected
export const createCategoryController = catchAsync(async (request, response, next) => {
  //TODO check the plan quota: the assistant doesn't have any plan info, it's stored in the storeOwner. to make it easy let's add a reference tot he storeOwner plan in the store itself.

  sanitisedData(request.body, next);
  const {name, colour}:CategoryBasic = request.body;
  if(!name?.trim()) return next(new AppError(400, "Please add a name to the category"));

  const data = { name, colour, createdBy: {username: request.user.username, id:request.user.id} };
  const newCategory = await createDoc(request.Model, data);

  response.status(201).json({
    success: true,
    newCategory,
  });
});

export const getAllCategoriesController = catchAsync(async (request, response, next) => {

  const categories = await getAllDocs(request.Model, request);
  if (!categories) return next(new AppError(404, "لا يوجد فئات في هذا المتجر"));

  response.status(200).json({
    success: true,
    categories,
  });
});

export const getCategoryController = catchAsync(async (request, response, next) => {

  const category = await getOneDoc(request.Model, request.params.categoryId);
  if (!category) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    category,
  });
});

export const updateCategoryNewController = catchAsync(async (request, response, next) => {});
export const deleteCategoryNewController = catchAsync(async (request, response, next) => {});

export async function updateProductInCategoryController(modelId:string, categories:Array<CategoryDocument>,  productId:string | mongoose.Types.ObjectId, operationType: "assign" | "delete") {
  console.log("updateProductInCategoryController", operationType);
  const Model = await getDynamicModel<CategoryDocument>("Category", modelId);
  if(operationType === "assign" )await assignProductToCategory(Model, categories, productId);
  else await deleteProductFromCategory(Model, categories, productId);
}
export async function deleteCategoriesCollectionController (storeId:string | mongoose.Types.ObjectId) {
  // STEP 1) stringify the Object.id:
  const stringifiedId = JSON.parse(JSON.stringify(storeId));

  // STEP 2) check if the DyMo is existing before deletion:
  const isExist = await isDynamicModelExist(`Category-${stringifiedId}`);
  console.log("isexist", isExist);
  if(!isExist) return;
  console.log("did it return??");
  await deleteMongoCollection(`category-${stringifiedId}`); 
  lruCache.delete(`Product-${stringifiedId}`);
  console.log("test lru", lruCache.get(`Category-${stringifiedId}`));
}
