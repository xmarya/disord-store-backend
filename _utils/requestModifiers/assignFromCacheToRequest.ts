import { getOneDocByFindOne } from "../../_services/global";
import { MongoId } from "../../_Types/MongoId";
import Store from "../../models/storeModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { getRedisHash } from "../redisOperations/redisHash";

type StoreAndPlan = {
  store: MongoId;
  plan: MongoId;
  isPaid: boolean;
  planExpiryDate: Date;
};
export const assignFromCacheToRequest = catchAsync(async (request, response, next) => {
  if (request.user.userType !== "storeOwner" && request.user.userType !== "storeAssistant") return next(new AppError(403, "غير مصرح لك الوصول للصفحة"));
  const userId = request.user._id;
  const store = await getOneDocByFindOne(Store, { condition: { $or: [{ owner: userId }, { storeAssistants: userId }] } });
  const key = `StoreAndPlan:${store?.id}`;
  const data = await getRedisHash<StoreAndPlan>(key);
  if (!data) return next();

  const { store: cacheStore, plan, isPaid, planExpiryDate } = data;

  request.store = cacheStore;
  request.plan = plan;
  request.isPlanPaid = isPaid;
  request.planExpiryDate = planExpiryDate;

  next();
});

export default assignFromCacheToRequest;
