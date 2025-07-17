import { MongoId } from "../../_Types/MongoId";
import { catchAsync } from "../catchAsync";
import { getHash } from "../redisOperations/redisHash";

type StoreAndPlan = {
  store: MongoId;
  plan: MongoId;
  isPaid: boolean;
  planExpiryDate: Date;
};
export const assignFromCacheToRequest = catchAsync(async (request, response, next) => {
  const userId = request.user.id;
  const key = `StoreAndPlan:${userId}`;
  const data = await getHash<StoreAndPlan>(key);
  if (!data) return next();

  const { store, plan, isPaid, planExpiryDate } = data;

  request.store = store;
  request.plan = plan;
  request.isPlanPaid = isPaid;
  request.planExpiryDate = planExpiryDate;

  next();
});

export default assignFromCacheToRequest;
