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
    newProd,
  });
});

export const getOneProductController = catchAsync(async (request, response, next) => {
  let product = await getOneDocById(Product, request.params.productId);
  if (!product) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));
  const cats = await categoriesInCache(request.params.productId);

  product.categories = cats as CategoryDocument[];

  response.status(200).json({
    success: true,
    product,
  });
});

export const updateProductController = catchAsync(async (request, response, next) => {
  if (!request.body || Object.keys(request.body).length === 0) return next(new AppError(400, "no data was provided in the request.body"));

  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const productId = request.params.productId;

  /* OLD CODE (kept for reference): 
    if (categories && categories.length !== 0) {
      const [_, modelId] = request.Model.modelName.split("-");
      await updateProductInCategoryController(modelId, categories, productId, "assign");
      updatedProduct = await updateProduct(request.Model, productId, request.body); 
      }
    else updatedProduct = await updateDoc(request.Model, productId, request.body);
  */

  const updatedProduct = await updateProduct(request.store, productId, request.body);
  if (!updatedProduct) return next(new AppError(400, "تأكد من صحة البيانات"));

  if (categories) {
    await updateProductInCategories(categories, productId); /*✅*/
    await setCompressedCacheData(`Category:${productId}`, updatedProduct.categories, "fifteen-minutes"); // set the new cats, without waiting
  }

  response.status(203).json({
    success: true,
    updatedProduct,
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
    result /*REQUIRES TESTING */,
  });
});

/* OLD CODE (kept for reference): 
export async function deleteProductsCollectionController(storeId:MongoId) {
  console.log("storeId for delete", storeId);
  // 1) stringify the Object.id:
  const stringifiedId = JSON.parse(JSON.stringify(storeId));
  
  // 2) check if the DyMo is existing before deletion:
  const isExist = await isDynamicModelExist(`Product-${stringifiedId}`);
  
  if (!isExist) return;
  console.log("did it return??");
  await deleteMongoCollection(`product-${stringifiedId}`);
  lruCache.delete(`Product-${stringifiedId}`);
  console.log("test lru", lruCache.get(`Product-${stringifiedId}`));
}
*/
