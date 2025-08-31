import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import formatSubscriptionsLogs from "@utils/subscriptions/formatSubscriptionsLogs";
import safeThrowable from "@utils/safeThrowable";

async function getStoreOwnerSubscriptionsLog(storeOwner: MongoId) {
  const safeGetSubscriptionsLog = safeThrowable(
    () => getOneDocById(User, storeOwner, { select: ["subscribedPlanDetails", "subscriptionsLog"] }),
    (error) => new Error((error as Error).message)
  );

  const subscriptionsLogResult = await extractSafeThrowableResult(() => safeGetSubscriptionsLog);

  if (!subscriptionsLogResult.ok) return subscriptionsLogResult;

  const { result: logs } = subscriptionsLogResult;
  const { subscribedPlanDetails, subscriptionsLog, planExpiresInDays } = logs as UserDocument & { planExpiresInDays: string };
  const currentSubscription = formatSubscriptionsLogs(subscribedPlanDetails, planExpiresInDays);

  return {...subscriptionsLogResult, result: {currentSubscription, subscriptionsLog}}
}

export default getStoreOwnerSubscriptionsLog;
