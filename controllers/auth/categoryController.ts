import Category from "@models/categoryModel";
import { createDoc, deleteDoc, getAllDocs, getOneDocByFindOne, updateDoc } from "@repositories/global";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";

// protected
export const createCategoryController = catchAsync(async (request, response, next) => {
  const { name } = request.body;
  if (!name?.trim()) return next(new AppError(400, "Please add a name to the category"));

  const userName = `${request.user.firstName} ${request.user.lastName}`;
  const userId = request.user.id;
  const storeId = request.store;
  const createdBy = { name: userName, id: userId };
  const data = { name, createdBy, store: storeId };
  const newCategory = await createDoc(Category, data);

  response.status(201).json({
    success: true,
    data: { newCategory },
  });
});

export const getAllCategoriesController = catchAsync(async (request, response, next) => {
  const categories = await getAllDocs(Category, request.query, { condition: { store: request.store } });
  if (!categories) return next(new AppError(404, "لا يوجد فئات في هذا المتجر"));

  response.status(200).json({
    success: true,
    results: categories.length,
    data: { categories },
  });
});

export const getCategoryController = catchAsync(async (request, response, next) => {
  // const category = await getOneDocById(Category, request.params.categoryId);
  // another way of doing it. it is not a duplicated step for hasAuthorisation middleware.
  // without this extra condition the user can use a categoryId of a different store and still can get it
  const category = await getOneDocByFindOne(Category, { condition: { id: request.params.categoryId, store: request.store } });
  if (!category) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    data: { category },
  });
});

export const updateCategoryController = catchAsync(async (request, response, next) => {
  /*✅*/
  const { name } = request.body;
  const { categoryId } = request.params;
  const updatedBy = { name: `${request.user.firstName} ${request.user.lastName}`, id: request.user.id, date: new Date() };
  const updatedCategory = await updateDoc(Category, categoryId, { name, updatedBy }, { condition: { store: request.store } });

  response.status(201).json({
    success: true,
    data: { updatedCategory },
  });
});
export const deleteCategoryController = catchAsync(async (request, response, next) => {
  const { categoryId } = request.params;
  await deleteDoc(Category, categoryId);
  response.status(204).json({
    success: true,
  });
});