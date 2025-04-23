import { createProduct, getAllProducts } from "../../_services/product/productServices";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import Product from "../../models/productModel";
import { deleteOne, getOne, updateOne } from "../global";

// protected routes
export const createProductController = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);

  // const storeId = request.user.myStore || request.params.storeId;
  // if(!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));
  // const data = { ...request.body, store: storeId };
  const data = { ...request.body }; // the storeId now within the request.body (refer to isStoreIdExist middleware)

  const newProd = await createProduct(data);
  response.status(201).json({
    success: true,
    newProd,
  });
});

export const getAllProductsController = catchAsync(async (request, response, next) => {
  // const storeId = request.user.myStore || request.params.storeId;
  // if (!storeId) return next(new AppError(400, "لابد من توفير معرف المتجر"));

  // const products = await getAllProducts(storeId);
  const products = await getAllProducts(request.store);

  if (!products) return next(new AppError(400, "لا يوجد منتجات في هذا المتجر"));

  response.status(200).json({
    success: true,
    products,
  });
});

export const getProductController = getOne("Product");
export const updateProductController = updateOne("Product");
export const deleteProductController = deleteOne("Product");