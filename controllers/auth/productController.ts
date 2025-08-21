import { startSession } from "mongoose";
import { deleteProductFromCategory, updateProductInCategories } from "@repositories/category/categoryRepo";
import { createDoc, deleteDoc, getOneDocById } from "@repositories/global";
import { updateProduct } from "@repositories/product/productRepo";
import { CategoryDocument } from "@Types/Category";
import { AppError } from "@utils/AppError";
import { deleteFromCache, setCompressedCacheData } from "../../externals/redis/cacheControllers/globalCache";
import { catchAsync } from "@utils/catchAsync";
import Product from "@models/productModel";
import { categoriesInCache } from "./categoryController";
import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";

export const createProductController = catchAsync(async (request, response, next) => {
  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const storeId = request.store;
  const data = { store: storeId, ...request.body };

  const newProd = await createDoc(Product, data);
  if (categories) {
    await updateProductInCategories(categories, newProd.id);
    await setCompressedCacheData(`Category:${newProd.id}`, newProd.categories, "fifteen-minutes"); // set the new cats, without waiting
  }

  response.status(201).json({
    success: true,
    data: {newProd},
  });
});

export const getOneProductController = catchAsync(async (request, response, next) => {
  let product = await getOneDocById(Product, request.params.productId);
  if (!product) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));
  const cats = await categoriesInCache(request.params.productId);

  product.categories = cats as CategoryDocument[];

  response.status(200).json({
    success: true,
    data: {product},
  });
});

export const updateProductController = catchAsync(async (request, response, next) => {
  if (!request.body || Object.keys(request.body).length === 0) return next(new AppError(400, "no data was provided in the request.body"));

  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const productId = request.params.productId;

  const updatedProduct = await updateProduct(request.store, productId, request.body);
  if (!updatedProduct) return next(new AppError(400, "تأكد من صحة البيانات"));

  if (categories) {
    await updateProductInCategories(categories, productId); /*✅*/
    await setCompressedCacheData(`Category:${productId}`, updatedProduct.categories, "fifteen-minutes"); // set the new cats, without waiting
  }

  response.status(203).json({
    success: true,
    data: {updatedProduct},
  });
});

export const deleteProductController = catchAsync(async (request, response, next) => {
  const productId = request.params.productId;

  const session = await startSession();

  const result = await session.withTransaction(async () => {
    const deletedProduct = await deleteDoc(Product, productId, { session });
    if (!deletedProduct) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

    await deleteProductFromCategory(deletedProduct.categories, productId, session); /*✅*/
    await deleteAllResourceReviews(productId, session);

    return deletedProduct;
  });

  deleteFromCache(`Product:${productId}`); // remove from cache if exist

  response.status(204).json({
    success: true,
    data: {result},
  });
});

