import getStoreOf from "@services/auth/storeServices/getStoreOfOwner";
import { CacheStoreAndPlan } from "@Types/externalAPIs/CacheStoreAndPlan";
import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";
import { MongoId } from "@Types/Schema/MongoId";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";
import { getRedisHash } from "../../externals/redis/redisOperations/redisHash";

export const assignFromCacheToRequest = catchAsync(async (request, response, next) => {
  console.log("assignFromCacheToRequest");
  if (request.user.userType !== "storeOwner" && request.user.userType !== "storeAssistant") return new Forbidden();

  const userId = request.user.id;
  const getStoreResult = await getStoreOf(userId);

  if (!getStoreResult.ok && getStoreResult.reason === "not-found") return next(returnError(new NotFound("لم يتم العثور على المتجر")));
  if (!getStoreResult.ok) return next(returnError(getStoreResult));

  const { result: store } = getStoreResult;

  const key = `StoreAndPlan:${store.id}`;
  const data = await getRedisHash<CacheStoreAndPlan>(key);
  if (!data) return next();

  const { store: cacheStore, plan, isPaid, planExpiryDate } = data;

  request.store = cacheStore;
  request.plan = plan;
  request.isPlanPaid = isPaid;
  request.planExpiryDate = planExpiryDate;

  next();
});

export default assignFromCacheToRequest;
