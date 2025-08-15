import { startSession } from "mongoose";
import { getAllDocs, getOneDocById } from "../../_services/global";
import { AppError } from "../../_utils/AppError";
import { setCompressedCacheData } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "../../_utils/catchAsync";
import Product from "../../models/productModel";
import Store from "../../models/storeModel";

export const getStoresListController = catchAsync(async (request, response, next) => {
  const storesList = await getAllDocs(Store, request, { select: ["storeName", "logo", "description", "ranking", "ratingsAverage", "ratingsQuantity", "verified"] });
  if (!storesList) return next(new AppError(404, "لم يتم العثور على أية متاجر"));

  await setCompressedCacheData(`Store:${JSON.stringify(request.query)}`, storesList, "fifteen-minutes");

  response.status(200).json({
    success: true,
    result: storesList.length,
    storesList,
  });
});

export const getProductsListController = catchAsync(async (request, response, next) => {
  //ENHANCE: exclude suspended / under maintenance stores' products
  const productsList = await getAllDocs(Product, request, { select: ["name", "description", "store", "stock", "price", "image", "ratingsAverage", "ratingsQuantity", "ranking", "productType"] });
  if (!productsList) return next(new AppError(404, "لم يتم العثور على منتجات"));

  await setCompressedCacheData(`Product:${JSON.stringify(request.query)}`, productsList, "fifteen-minutes");
  response.status(200).json({
    success: true,
    result: productsList.length,
    productsList,
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
    store,
    products,
  });
});
