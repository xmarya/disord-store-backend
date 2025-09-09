import { MongoId } from "@Types/Schema/MongoId";
import { createRedisHash } from "../redisOperations/redisHash";

async function cacheStoreAndPlan(storeId: MongoId, planId: MongoId, isPaid: boolean, planExpiryDate: Date) {
  const data = { store:storeId, plan:planId, isPaid, planExpiryDate };

  await createRedisHash(`StoreAndPlan:${storeId}`, data, "one-hour");
}

export default cacheStoreAndPlan;

/*
hash format
    StoreAndPlan:storeId => {
    store: id,
    plan:
    isPaid:
    expiringDate:
    }

    I decided to use the storeId instead of the userId to prevent redundant data in case
    there is an owner and an assistant are logged-in to the system at the same time,
    so they both can access the same hash 
*/
