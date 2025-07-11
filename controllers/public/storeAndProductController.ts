import { getAllDocs } from "../../_services/global";
import { getStoreWithProducts } from "../../_services/store/storeService";
import { AppError } from "../../_utils/AppError";
import { setCachedData } from "../../_utils/cacheControllers/globalCache";
import { catchAsync } from "../../_utils/catchAsync";
import Product from "../../models/productModel";
import Store from "../../models/storeModel";

export const getStoresListController = catchAsync(async (request, response, next) => {
  const storesList = await getAllDocs(Store, request, { select: ["storeName", "logo", "description", "ranking", "ratingsAverage", "ratingsQuantity", "verified"] });
  if (!storesList) return next(new AppError(404, "لم يتم العثور على أية متاجر"));

  setCachedData(`Store:${JSON.stringify(request.query)}`, storesList, "long");

  response.status(200).json({
    success: true,
    result: storesList.length,
    storesList,
  });
});

export const getProductsListController = catchAsync(async (request, response, next) => {
  const productsList = await getAllDocs(Product, request, { select: ["name", "description", "store", "stock", "price", "image", "ratingsAverage", "ratingsQuantity", "ranking", "productType"] });
  if (!productsList) return next(new AppError(404, "لم يتم العثور على منتجات"));

  setCachedData(`Product:${JSON.stringify(request.query)}`, productsList, "long");
  response.status(200).json({
    success: true,
    result: productsList.length,
    productsList,
  });
});

export const getStoreWithProductsController = catchAsync(async (request, response, next) => {

  const { storeId } = request.params;

  const { store, products } = await getStoreWithProducts(storeId);
  // NOTE: how to get the ratings/rankings of all the products? + how to allow filtering them?

  if (store) delete (store as any)?.owner;

  response.status(200).json({
    success: true,
    store,
    products,
  });
});
