import eventBus from "@config/EventBus";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import createNewUnlimitedPlan from "@services/auth/plan/createNewUnlimitedPlan";
import createUnlimitedStoreOwner from "@services/auth/storeOwnerServices/createUnlimitedStoreOwner";
import { PlanSubscriptionUpdateEvent } from "@Types/events/PlanSubscriptionEvents";
import { UnlimitedPlanDataBody } from "@Types/Schema/Plan";
import { UnlimitedStoreOwnerData } from "@Types/Schema/Users/StoreOwner";
import { startSession } from "mongoose";
import { err } from "neverthrow";

async function createUnlimitedPlanAndOwnerByAdmin(unlimitedPlanDetails: Omit<UnlimitedPlanDataBody, "planName">, storeOwnerData: UnlimitedStoreOwnerData) {
  const session = await startSession();

  let newUnlimitedStoreOwner;
  try {
    session.startTransaction();
    const newUnlimitedPlan = await createNewUnlimitedPlan({ planName: "unlimited", ...unlimitedPlanDetails }, session);
    if(storeOwnerData.subscriptionType === "new") await createNewCredentials({...storeOwnerData, userType: "storeOwner"}, session);
    newUnlimitedStoreOwner = await createUnlimitedStoreOwner(storeOwnerData, newUnlimitedPlan, session);

    await session.commitTransaction();

    const event: PlanSubscriptionUpdateEvent = {
      type: "planSubscription.updated",
      payload: {
        storeOwner: newUnlimitedStoreOwner,
        planId: newUnlimitedPlan.id,
        planName: newUnlimitedPlan.planName,
        subscriptionType: storeOwnerData.subscriptionType,
        profit: unlimitedPlanDetails.price.riyal,
        planExpiryDate: newUnlimitedStoreOwner.subscribedPlanDetails.subscribeEnds,
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

export default createUnlimitedPlanAndOwnerByAdmin;
