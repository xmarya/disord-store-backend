import Plan from "@models/planModel";
import Product from "@models/productModel";
import Store from "@models/storeModel";
import { getAllDocs, getOneDocById } from "@repositories/global";
import getAllProductsForPublic from "@services/productServices/getAllProductsForPublic";
import getAllStoresForPublic from "@services/storeServices/getAllStoresForPublic";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import { startSession } from "mongoose";

export const getStoresListController = catchAsync(async (request, response, next) => {

  const result = await getAllStoresForPublic(request.query);

  if(!result.ok) return next(returnError(result));

  const {result:storesList} = result;

  response.status(200).json({
    success: true,
    result: storesList.length,
    data: {storesList},
  });
});

export const getProductsListController = catchAsync(async (request, response, next) => {
  const result = await getAllProductsForPublic(request.query);
  if(!result.ok) return next(returnError(result));

  const {result: productsList} = result
  response.status(200).json({
    success: true,
    result: productsList.length,
    data: {productsList},
  });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {
  const { storeId } = request.params;

  const session = await startSession();
  const { store, products } = await session.withTransaction(async () => {
    const store = await getOneDocById(Store, storeId, { session });
    const products = await getAllDocs(Product, request, { condition: { store: storeId } });

    return { store, products };
  });
  // NOTE: how to get the ratings/rankings of all the products? + how to allow filtering them?

  if (store) delete (store as any)?.owner;

  response.status(200).json({
    success: true,
    data: { store, products },
  });
});

export const getAllPlansController = catchAsync(async (request, response, next) => {
  const plans = await getAllDocs(Plan, request.query);
  if (!plans) return next(new AppError(440, "no data was found"));

  response.status(200).json({
    success: true,
    data: { plans },
  });
});
