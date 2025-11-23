import Product from "@models/productModel";
import { createDoc } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { ProductDataBody } from "@Types/Schema/Product";
import { startSession } from "mongoose";
import updateCategoryRelatedToProduct from "../categoryServices/updateCategoryRelatedToProduct";
import { Success } from "@Types/ResultTypes/Success";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { ProductCreatedEvent } from "@Types/events/ProductEvents";

async function createNewProduct(storeId: MongoId, newProductData: ProductDataBody) {
  const data = { store: storeId, ...newProductData };
  const { categories } = newProductData;
  const session = await startSession();
  const newProduct = await session.withTransaction(async () => {
    const newProduct = await createDoc(Product, data, { session });

    if (newProduct?.id) {
      categories && (await updateCategoryRelatedToProduct(categories, newProduct.id));
      await createOutboxRecord<[ProductCreatedEvent]>([{ type: "product-created", payload: { product: newProduct } }], session);
    }
    return newProduct;
  });

  if (!newProduct?.id) return new Failure();

  return new Success(newProduct);
}

export default createNewProduct;
