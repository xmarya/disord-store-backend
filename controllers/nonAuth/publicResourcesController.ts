import Plan from "@models/planModel";
import { getAllDocs } from "@repositories/global";
import getAllProductsForPublic from "@services/nonAuth/storeAndProducts/getAllProductsForPublic";
import getAllStoresForPublic from "@services/nonAuth/storeAndProducts/getAllStoresForPublic";
import getOneStoreWithItsProducts from "@services/nonAuth/storeAndProducts/getOneStoreWithItsProducts";
import { AppError } from "@Types/ResultTypes/errors/AppError";
import { catchAsync } from "@utils/catchAsync";
import isErr from "@utils/isErr";
import returnError from "@utils/returnError";

export const getStoresListController = catchAsync(async (request, response, next) => {
  const result = await getAllStoresForPublic(request.query);

  if (!result.ok) return next(returnError(result));

  const { result: storesList } = result;

  response.status(200).json({
    success: true,
    result: storesList.length,
    data: storesList
  });
});

export const getProductsListController = catchAsync(async (request, response, next) => {
  const result = await getAllProductsForPublic(request.query);
  if (!result.ok) return next(returnError(result));

  const { result: productsList } = result;
  response.status(200).json({
    success: true,
    result: productsList.length,
    data: productsList
  });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {
  const { storeId } = request.params;

  const result = await getOneStoreWithItsProducts(storeId, request.query);

  if (isErr(result)) return next(returnError({ reason: "not-found", message: result.error }));

  const {result: {store, products}} = result;
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
    data: plans
  });
});