import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function assignStoreOwnerToUnlimitedPlanConsumer(event: PlanSubscriptionUpdatedEvent) {
  const { storeOwner, planId, planName } = event.payload;

  if (planName !== "unlimited") return new Success({ serviceName: "plansCollection", ack: true });
  const safeUpdateUnlimitedPlan = safeThrowable(
    () => updateDoc(Plan, planId, { unlimitedUser: storeOwner._id }),
    (error) => new Failure((error as Error).message)
  );

  const updateUnlimitedPlanResult = await extractSafeThrowableResult(() => safeUpdateUnlimitedPlan);
  if (!updateUnlimitedPlanResult.ok) return new Failure(updateUnlimitedPlanResult.message, { serviceName: "plansCollection", ack: false });

  return new Success({ serviceName: "plansCollection", ack: true });
}

export default assignStoreOwnerToUnlimitedPlanConsumer;
