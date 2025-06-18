import { createDoc, deleteDoc, getAllDocs, getOneDocById } from "../../_services/global";
import { updateProduct } from "../../_services/product/productServices";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import Product from "../../models/productNewModel";
import { updateProductInCategoryController } from "./categoryController";

export const createProductController = catchAsync(async (request, response, next) => { /*REQUIRES TESTING*/
  const { categories } = request.body;
  if (categories && categories.constructor !== Array) return next(new AppError(400, "the categories should be inside an array")); /*✅*/

  const storeId = request.store;
  const data = { store: storeId, ...request.body };

  const newProd = await createDoc(Product, data);
  await updateProductInCategoryController(categories, newProd.id, "assign");
  response.status(201).json({
    success: true,
    newProd,
  });
});

export const getAllProductsController = catchAsync(async (request, response, next) => {
  const products = await getAllDocs(Product, request);
  if (!products) return next(new AppError(404, "لم يتم العثور على منتجات"));

  response.status(200).json({
    success: true,
    result: products.length,
    products,
  });
});

export const getOneProductController = catchAsync(async (request, response, next) => {
  const product = await getOneDocById(Product, request.params.productId);
  if (!product) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

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
  await updateProductInCategoryController(categories, updatedProduct.id, "assign"); /*✅*/

  response.status(201).json({
    success: true,
    updatedProduct,
  });
});

export const deleteProductController = catchAsync(async (request, response, next) => {
  const productId = request.params.productId;

  const deletedProduct = await deleteDoc(Product, productId);
  if (!deletedProduct) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  /* OLD CODE (kept for reference): 
  const {categories} = deletedProduct as ProductDocument
  const [_, modelId] = request.Model.modelName.split("-");
  */
  await updateProductInCategoryController(deletedProduct.categories, productId, "delete"); /*✅*/
  /*TODO:
  await Ranking.deleteOne(deletedDoc.id);
  console.log("now check Ranking after delete");
  await Review.deleteMany({ reviewedModel: deletedDoc.id})
  */

  response.status(204).json({
    success: true,
    deletedProduct,
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
