import { assignProductToCategory, deleteProductFromCategory } from "../../_services/category/categoryService";
import { createDoc, deleteDoc, getAllDocs, getOneDocByFindOne, getOneDocById, updateDoc } from "../../_services/global";
import { CategoryBasic } from "../../_Types/Category";
import { MongoId } from "../../_Types/MongoId";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Category from "../../models/categoryModel";

// protected
export const createCategoryController = catchAsync(async (request, response, next) => {

  const { name, colour } = request.body;
  if (!name?.trim()) return next(new AppError(400, "Please add a name to the category"));

  const userName = `${request.user.firstName} ${request.user.lastName}`;
  const userId = request.user.id;
  const storeId = request.store;

  const data: CategoryBasic = { name, colour, createdBy: { name: userName, id: userId }, store: storeId };
  const newCategory = await createDoc(Category, data);

  response.status(201).json({
    success: true,
    newCategory,
  });
});

export const getAllCategoriesController = catchAsync(async (request, response, next) => {
  const categories = await getAllDocs(Category, request);
  if (!categories) return next(new AppError(404, "لا يوجد فئات في هذا المتجر"));

  response.status(200).json({
    success: true,
    categories,
  });
});

export const getCategoryController = catchAsync(async (request, response, next) => {
  // const category = await getOneDocById(Category, request.params.categoryId);
  // another way of doing it. it is not a duplicated step for hasAuthorisation middleware.
  // without this extra condition the user can use a categoryId of a different store and still can get it
  const category = getOneDocByFindOne(Category, { condition: { _id: request.params.categoryId, store: request.store } });

  if (!category) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    category,
  });
});

export const updateCategoryController = catchAsync(async (request, response, next) => { /*✅*/
  // NOTE: only allow the category's name and colour to be editable:
  const { name, colour } = request.body;
  const { categoryId } = request.params;
  const updatedCategory = await updateDoc(Category, categoryId, {name, colour}, { condition: { store: request.store } });

  response.status(201).json({
    success: true,
    updatedCategory,
  });
});
export const deleteCategoryController = catchAsync(async (request, response, next) => {
  const { categoryId } = request.params;
  await deleteDoc(Category, categoryId);
  response.status(204).json({
    success: true,
  });
});

export async function updateProductInCategoryController(categories: Array<CategoryBasic>, productId: MongoId, operationType: "assign" | "delete") {
  if (operationType === "assign") await assignProductToCategory(categories, productId);
  else deleteProductFromCategory(categories, productId);
}

/* OLD CODE (kept for reference): 
export async function updateProductInCategoryController(modelId:string, categories:Array<CategoryDocument>,  productId:MongoId, operationType: "assign" | "delete") {
  console.log("updateProductInCategoryController", operationType);
  const Model = await getDynamicModel<CategoryDocument>("Category", modelId);
  if(operationType === "assign" )await assignProductToCategory(Model, categories, productId);
  else await deleteProductFromCategory(Model, categories, productId);
}
export async function deleteCategoriesCollectionController (storeId:MongoId) {
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
*/
