import Product from "@models/productModel";
import { deleteDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function deleteProductAndItsRelated(productId: MongoId) {
  try {
    const session = await startSession();
    await session.withTransaction(async () => {
      const deletedProduct = await deleteDoc(Product, productId, { session });
      if (deletedProduct) {
        const payload: ProductDeletedEvent["payload"] = {
          outboxRecordId: "",
          productId: deletedProduct.id,
          categories: deletedProduct.categories as MongoId[],
        };
        await createOutboxRecord<[ProductDeletedEvent]>([{ type: "product-deleted", payload }], session);
      }

    });

    await session.endSession();
    return new Success("product was deleted successfully");
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default deleteProductAndItsRelated;
