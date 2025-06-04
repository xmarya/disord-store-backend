import lruCache from "../../_config/LRUCache";
import { createDoc, deleteDoc, deleteMongoCollection, getAllDocs, getOneDocById, updateDoc } from "../../_services/global";
import { updateProduct } from "../../_services/product/productServices";
import { ProductBasic, ProductDocument } from "../../_Types/Product";
import { AppError } from "../../_utils/AppError";
import { catchAsync } from "../../_utils/catchAsync";
import { isDynamicModelExist } from "../../_utils/dynamicMongoModel";
import { updateProductInCategoryController } from "./categoryController";
import { MongoId } from "../../_Types/MongoId";

export const createProductNewController = catchAsync(async (request, response, next) => {
  const { name, description, price, image, stock }: ProductBasic = request.body;
  if (!name?.trim() || !price || !description?.trim() || !stock) return next(new AppError(400, "Please add all the product's necessary data"));

  // const storeId = request.user.myStore; // the storeId is also within the request.store (refer to isStoreIdExist middleware). but this middleware might be deleted in the future refactoring
  // console.log("Mystore", storeId);
  const newProd = await createDoc(request.Model, request.body);

  response.status(201).json({
    success: true,
    newProd,
  });
});

export const getAllProductsNewController = catchAsync(async (request, response, next) => {
  const products = await getAllDocs(request.Model, request);
  if (!products) return next(new AppError(404, "لم يتم العثور على منتجات"));

  response.status(200).json({
    success: true,
    products,
  });
});

export const getOneProductNewController = catchAsync(async (request, response, next) => {
  const product = await getOneDocById(request.Model, request.params.productId);
  if (!product) return next(new AppError(404, "لا توجد بيانات مرتبطة برقم المعرف"));

  response.status(200).json({
    success: true,
    product,
  });
});

export const updateProductNewController = catchAsync(async (request, response, next) => {
  delete request.body.modelId;
  if (!request.body || Object.keys(request.body).length === 0) return next(new AppError(400, "no data was provided in the request.body"));

  const { categories } = request.body;
  let updatedProduct;
  const productId = request.params.productId;
  if (categories && categories.length !== 0) {
    const [_, modelId] = request.Model.modelName.split("-");
    await updateProductInCategoryController(modelId, categories, productId, "assign");
    updatedProduct = await updateProduct(request.Model, productId, request.body); /*✅*/
  }
  else updatedProduct = await updateDoc(request.Model, productId, request.body);

  if (!updatedProduct) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  response.status(201).json({
    success: true,
    updatedProduct,
  });
});

export const deleteProductNewController = catchAsync(async (request, response, next) => {
  const productId = request.params.productId;

  const deletedProduct = await deleteDoc(request.Model, productId);
  if (!deletedProduct) return next(new AppError(500, "حدث خطأ أثناء معالجة العملية. حاول مجددًا"));

  const {categories} = deletedProduct as ProductDocument
  const [_, modelId] = request.Model.modelName.split("-");
  await updateProductInCategoryController(modelId, categories, productId, "delete"); /*REQUIRES TESTING */
  response.status(204).json({
    success: true,
    deletedProduct,
  });
});

export async function deleteProductsCollectionController(storeId:MongoId) {
  console.log("storeId for delete", storeId);
  // STEP 1) stringify the Object.id:
  const stringifiedId = JSON.parse(JSON.stringify(storeId));

  // STEP 2) check if the DyMo is existing before deletion:
  const isExist = await isDynamicModelExist(`Product-${stringifiedId}`);
  console.log("isexist", isExist);
  if (!isExist) return;
  console.log("did it return??");
  await deleteMongoCollection(`product-${stringifiedId}`);
  lruCache.delete(`Product-${stringifiedId}`);
  console.log("test lru", lruCache.get(`Product-${stringifiedId}`));
}
