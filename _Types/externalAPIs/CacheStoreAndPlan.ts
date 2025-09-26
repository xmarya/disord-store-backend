import { MongoId } from "@Types/Schema/MongoId";

export type CacheStoreAndPlan = {
  store: MongoId;
  plan: MongoId;
  isPaid: boolean;
  planExpiryDate: Date;
};