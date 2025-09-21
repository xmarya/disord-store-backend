import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import createNewUnlimitedPlan from "@services/auth/plan/createNewUnlimitedPlan";
import createUnlimitedStoreOwner from "@services/auth/storeOwnerServices/createUnlimitedStoreOwner";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { UnlimitedPlanDataBody } from "@Types/Schema/Plan";
import { UnlimitedStoreOwnerData } from "@Types/Schema/Users/StoreOwner";
import { startSession } from "mongoose";

async function createUnlimitedPlanAndOwnerByAdmin(unlimitedPlanDetails: Omit<UnlimitedPlanDataBody, "planName">, storeOwnerData: UnlimitedStoreOwnerData) {
  const session = await startSession();

  const newUnlimitedStoreOwner = await session.withTransaction(async () => {
    const newUnlimitedPlan = await createNewUnlimitedPlan({ planName: "unlimited", ...unlimitedPlanDetails }, session);
    if (storeOwnerData.subscriptionType === "new") await createNewCredentials({ ...storeOwnerData, userType: "storeOwner" }, session);
    const newUnlimitedStoreOwner = await createUnlimitedStoreOwner(storeOwnerData, newUnlimitedPlan, session);
      const payload: PlanSubscriptionUpdatedEvent["payload"] = {
        storeOwner: newUnlimitedStoreOwner,
        planId: newUnlimitedPlan.id,
        planName: newUnlimitedPlan.planName,
        subscriptionType: storeOwnerData.subscriptionType,
        profit: unlimitedPlanDetails.price.riyal,
        planExpiryDate: newUnlimitedStoreOwner.subscribedPlanDetails.subscribeEnds,
      }
      await createOutboxRecord<[PlanSubscriptionUpdatedEvent]>([{ type: "planSubscription-updated", payload }], session);

      return newUnlimitedStoreOwner;
    }
  );

  return { email: newUnlimitedStoreOwner?.email, subscribedPlanDetails: newUnlimitedStoreOwner?.subscribedPlanDetails };
}

export default createUnlimitedPlanAndOwnerByAdmin;
