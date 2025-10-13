import createNewProduct from "@services/auth/productServices/createNewProduct";
import deleteProductAndItsRelated from "@services/auth/productServices/deleteProductAndItsRelated";
import getAllProductsForAuthorisedUser from "@services/auth/productServices/getAllProductsForAuthorisedUser";
import getOneProduct from "@services/auth/productServices/getOneProduct";
import updateOneProduct from "@services/auth/productServices/updateProduct";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

export const createProductController = catchAsync(async (request, response, next) => {
  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const storeId = request.store;

  const result = await createNewProduct(storeId, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: newProd } = result;

  response.status(201).json({
    success: true,
    data: newProd,
  });
});

export const getAllStoreProducts = catchAsync(async (request, response, next) => {
  const result = await getAllProductsForAuthorisedUser(request.store, request.query);
  if (!result.ok) return next(returnError(result));

  const { result: productsList } = result;
  response.status(200).json({
    success: true,
    result: productsList.length,
    data: productsList,
  });
});

export const getOneProductController = catchAsync(async (request, response, next) => {
  const result = await getOneProduct(request.params.productId);
  if (!result.ok) return next(returnError(result));

  const { result: product } = result;

  response.status(200).json({
    success: true,
    data: product,
  });
});

export const updateProductController = catchAsync(async (request, response, next) => {
  if (!request.body || Object.keys(request.body).length === 0) return next(new AppError(400, "no data was provided in the request.body"));

  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const productId = request.params.productId;

  const result = await updateOneProduct(request.store, productId, request.body);
  if (!result.ok) return next(returnError(result));

  const { result: updatedProduct } = result;

  response.status(203).json({
    success: true,
    data: updatedProduct,
  });
});

export const deleteProductController = catchAsync(async (request, response, next) => {
  const productId = request.params.productId;

  const result = await deleteProductAndItsRelated(productId);
  if (!result.ok) return next(returnError(result));

  response.status(204).json({
    success: true,
    message: result.result,
  });
});
