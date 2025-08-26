import eventBus from "@config/EventBus";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import createNewUnlimitedPlan from "@services/planServices/createNewUnlimitedPlan";
import createUnlimitedStoreOwner from "@services/usersServices/storeOwnerServices.ts/createUnlimitedStoreOwner";
import { PlanSubscriptionUpdate } from "@Types/events/PlanSubscriptionEvents";
import { UnlimitedPlanDataBody } from "@Types/Plan";
import { UnlimitedStoreOwnerData } from "@Types/User";
import { startSession } from "mongoose";
import { err } from "neverthrow";

async function createUnlimitedPlanAndStoreOwner(unlimitedPlanDetails: Omit<UnlimitedPlanDataBody, "planName">, storeOwnerData: UnlimitedStoreOwnerData) {
  const session = await startSession();

  let newUnlimitedStoreOwner;
  try {
    session.startTransaction();
    const newUnlimitedPlan = await createNewUnlimitedPlan({ planName: "unlimited", ...unlimitedPlanDetails }, session);
    newUnlimitedStoreOwner = await createUnlimitedStoreOwner(storeOwnerData, newUnlimitedPlan, session);

    await session.commitTransaction();

    const event: PlanSubscriptionUpdate = {
      type: "planSubscription.updated",
      payload: {
        storeOwnerId: newUnlimitedStoreOwner.id,
        planId: newUnlimitedPlan.id,
        planName: newUnlimitedPlan.planName,
        subscriptionType: storeOwnerData.subscriptionType,
        profit: unlimitedPlanDetails.price.riyal,
      },
      occurredAt: new Date(),
    };

    eventBus.publish(event);

  } catch (error) {
    await session.abortTransaction();
    console.log("createUnlimitedStoreOwner ERROR", error);
    err(INTERNAL_ERROR_MESSAGE);

  } finally {
    await session.endSession();
  }

  return { email: newUnlimitedStoreOwner?.email, subscribedPlanDetails: newUnlimitedStoreOwner?.subscribedPlanDetails };
}

export default createUnlimitedPlanAndStoreOwner;
