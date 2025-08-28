import { startSession } from "mongoose";
import { getAllDocs, getOneDocById } from "@repositories/global";
import { AppError } from "@utils/AppError";
import { setCompressedCacheData } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "@utils/catchAsync";
import Product from "@models/productModel";
import Store from "@models/storeModel";
import getAllStores from "@services/storeServices/getAllStores";
import returnError from "@utils/returnError";

export const getStoresListController = catchAsync(async (request, response, next) => {

  const result = await getAllStores(request.query);

  if(!result.ok) return next(returnError(result));

  const {result:storesList} = result;

  response.status(200).json({
    success: true,
    result: storesList.length,
    data: {storesList},
  });
});

export const getProductsListController = catchAsync(async (request, response, next) => {
  console.log("getProductsListController");
  const productsList = await getAllDocs(Product, request.query, { select: ["name", "description", "store", "stock", "price", "image", "ratingsAverage", "ratingsQuantity", "ranking", "productType"] });
  if (!productsList) return next(new AppError(404, "لم يتم العثور على منتجات"));

  await setCompressedCacheData(`Product:${JSON.stringify(request.query)}`, productsList, "fifteen-minutes");
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
