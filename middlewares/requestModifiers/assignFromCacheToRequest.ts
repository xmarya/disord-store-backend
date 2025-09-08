import { CacheStoreAndPlan } from "@Types/externalAPIs/CacheStoreAndPlan";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import { getRedisHash } from "../../externals/redis/redisOperations/redisHash";

export const assignFromCacheToRequest = catchAsync(async (request, response, next) => {
  console.log("assignFromCacheToRequest");
  if (request.user.userType !== "storeOwner" && request.user.userType !== "storeAssistant") return new Forbidden();

  const userType = request.user.userType;
  
  let storeId = userType === "storeOwner" ? request.user.myStore : request.user.inStore;
  if(!storeId) return next(returnError(new NotFound("لم يتم العثور على المتجر")));

  console.log("does it search for the store.id as undefined which makes it loop forever producing the same result?", storeId);
  request.store = storeId;
  
  const key = `StoreAndPlan:${storeId}`;
  const data = await getRedisHash<CacheStoreAndPlan>(key);
  if (!data) return next();

  const { /*store: cacheStore,*/ plan, isPaid, planExpiryDate } = data;

  // request.store = cacheStore;
  request.plan = plan;
  request.isPlanPaid = isPaid;
  request.planExpiryDate = planExpiryDate;

  next();
});

export default assignFromCacheToRequest;
