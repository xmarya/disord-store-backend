import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import { deleteAllCategories } from "@repositories/category/categoryRepo";
import { deleteAllProducts } from "@repositories/product/productRepo";
import { deleteAllResourceReviews } from "@repositories/review/reviewRepo";
import { deleteStore } from "@repositories/store/storeRepo";
import { deleteStoreStats } from "@repositories/store/storeStatsRepo";
import { resetStoreOwnerToDefault } from "@repositories/storeOwner/storeOwnerRepo";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function deleteStorePermanently(storeId: MongoId) {
  const session = await startSession();
  // NOTE: this function MUST run within a transaction

  await session.withTransaction(async () => {
    //STEP 1) change userType and remove myStore:
    await resetStoreOwnerToDefault(storeId, session);

    //STEP 2) delete corresponding storeAssistant:
    await deleteAllAssistants(storeId, session);

    //STEP:3) delete products:
    await deleteAllProducts(storeId, session);

    //STEP:4) delete categories:
    await deleteAllCategories(storeId, session);

    //STEP:5) delete reviews:
    await deleteAllResourceReviews(storeId, session);

    //STEP:5) delete stats records:
    await deleteStoreStats(storeId, session);

    //STEP 7) delete the store:
    await deleteStore(storeId, session);

    //TODO: // ADD FEATURE for adding the deleted data to an AdminLog
  });

  await session.endSession();
}

export default deleteStorePermanently;
