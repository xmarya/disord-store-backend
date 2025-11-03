import { AllUsers } from "@Types/Schema/Users/AllUser";
import { setCompressedCacheData } from "./globalCache";
import safeThrowable from "@utils/safeThrowable";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { UserLoggedInEvent, UserUpdatedEvent } from "@Types/events/UserEvents";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { Success } from "@Types/ResultTypes/Success";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { MongoId } from "@Types/Schema/MongoId";

async function cacheUser(event: UserLoggedInEvent | UserUpdatedEvent | PlanSubscriptionUpdatedEvent) {
  let user: AllUsers;
  const payload = event.payload;
  user = ((payload as PlanSubscriptionUpdatedEvent["payload"]).storeOwner as AllUsers) || (payload as UserUpdatedEvent["payload"]).user;

  const userId = (user._id as MongoId).toString();
  const data = {
    id: userId,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    email: user.email,
    emailConfirmed: "emailConfirmed" in payload ? payload.emailConfirmed : undefined,
    ...(user.userType === "storeOwner" && { subscribedPlanDetails: user.subscribedPlanDetails, myStore: user.myStore }),
    ...(user.userType === "storeAssistant" && { inStore: user.inStore, inPlan: user.inPlan }),
    // TRANSLATE: the reason behind HOW TS COULD INFER THE RIGHT PART IN THE LINE ABOVE once I did user.userType === "storeOwner"
    // is because in AdminDocument I did explicitly set the userType to be "admin".
    // so, if the user.userType === "storeOwner" is true, then that denies the possibility of the user being of type AdminDocument,
    // leaving us with the other type
  };

  const safeCacheUser = safeThrowable(
    () => setCompressedCacheData(`User:${data.id}`, data, "one-hour"),
    (error) => new Failure((error as Error).message)
  );

  const cacheUserResult = await extractSafeThrowableResult(() => safeCacheUser);

  if (!cacheUserResult.ok) return new Failure(cacheUserResult.message, { serviceName: "redisUser", ack: false });

  return new Success({ serviceName: "redisUser", ack: true });
}

export default cacheUser;
