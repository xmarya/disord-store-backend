import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import { deleteAllCategories } from "@repositories/category/categoryRepo";
import { deleteAllProducts } from "@repositories/product/productRepo";
import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { deleteStore } from "@repositories/store/storeRepo";
import { deleteStoreStats } from "@repositories/store/storeStatsRepo";
import { MongoId } from "@Types/Schema/MongoId";
import mongoose from "mongoose";

// NOTE: this function must run inside a TRANSACTION
async function deleteStoreAndItsRelatedResourcePermanently(storeId: MongoId, session: mongoose.ClientSession) {
  //STEP 2) delete corresponding storeAssistant:
  await deleteAllAssistants(storeId, session);

  //STEP:3) delete products:
  await deleteAllProducts(storeId, session);

  //STEP:4) delete categories:
  await deleteAllCategories(storeId, session);

  //STEP:5) delete reviews:
  await deleteAllResourceReviews(storeId, session);

  //STEP:5) delete stats records:
  // NOTE: what if there are any unwithdrawn profits?
  await deleteStoreStats(storeId, session);

  //STEP 7) delete the store:
  await deleteStore(storeId, session);

}

export default deleteStoreAndItsRelatedResourcePermanently;
