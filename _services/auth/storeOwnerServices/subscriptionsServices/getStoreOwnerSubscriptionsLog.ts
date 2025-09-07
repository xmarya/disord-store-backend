import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import formatSubscriptionsLogs from "@utils/subscriptions/formatSubscriptionsLogs";
import safeThrowable from "@utils/safeThrowable";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import StoreOwner from "@models/storeOwnerModel";

async function getStoreOwnerSubscriptionsLog(storeOwnerId: MongoId) {
  const safeGetSubscriptionsLog = safeThrowable(
    () => getOneDocById(StoreOwner, storeOwnerId, { select: ["subscribedPlanDetails", "subscriptionsLog"] }),
    (error) => new Failure((error as Error).message)
  );

  const subscriptionsLogResult = await extractSafeThrowableResult(() => safeGetSubscriptionsLog);

  if (!subscriptionsLogResult.ok) return subscriptionsLogResult;

  const { result: logs } = subscriptionsLogResult;
  const { subscribedPlanDetails, subscriptionsLog, planExpiresInDays } = logs as StoreOwnerDocument & { planExpiresInDays: string };
  const currentSubscription = formatSubscriptionsLogs(subscribedPlanDetails, planExpiresInDays);

  return { ...subscriptionsLogResult, result: { ...currentSubscription, subscriptionsLog } };
}

export default getStoreOwnerSubscriptionsLog;
