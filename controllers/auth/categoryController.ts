import createNewCategory from "@services/auth/categoryServices/createNewCategory";
import deleteCategory from "@services/auth/categoryServices/deleteCategory";
import getAllCategories from "@services/auth/categoryServices/getAllCategories";
import getOneCategory from "@services/auth/categoryServices/getOneCategory";
import updateCategory from "@services/auth/categoryServices/updateCategory";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createCategoryController = catchAsync(async (request, response, next) => {
  const result = await createNewCategory(request.body, request.user as StoreOwnerDocument | StoreAssistantDocument, request.store);
  if (!result.ok) return next(returnError(result));

  const { result: newCategory } = result;

  response.status(201).json({
    success: true,
    data: newCategory,
  });
});

export const getAllCategoriesController = catchAsync(async (request, response, next) => {
  const result = await getAllCategories(request.store, request.query);
  if (!result.ok) return next(returnError(result));
  const { result: categories } = result;

  response.status(200).json({
    success: true,
    results: categories.length,
    data: categories,
  });
});

export const getCategoryController = catchAsync(async (request, response, next) => {
  const { categoryId } = request.params;

  const result = await getOneCategory(categoryId, request.store);
  if (!result.ok) return next(returnError(result));

  const { result: category } = result;

  response.status(200).json({
    success: true,
    data: category,
  });
});

export const updateCategoryController = catchAsync(async (request, response, next) => {
  const { categoryId } = request.params;
  const result = await updateCategory(request.body, categoryId, request.user as StoreOwnerDocument | StoreAssistantDocument, request.store);
  if (!result.ok) return next(returnError(result));

  const { result: updatedCategory } = result;
  response.status(201).json({
    success: true,
    data: updatedCategory,
  });
});

export const deleteCategoryController = catchAsync(async (request, response, next) => {
  const { categoryId } = request.params;
  const result = await deleteCategory(categoryId);
  if (!result.ok) return next(returnError(result));
  response.status(204).json({
    success: true,
  });
});
