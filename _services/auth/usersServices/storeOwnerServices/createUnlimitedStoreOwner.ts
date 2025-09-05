import { SUBSCRIPTION_PERIOD } from "@constants/ttl";
import { createNewUnlimitedUser } from "@repositories/user/userRepo";
import { PlanDocument } from "@Types/Schema/Plan";
import { UnlimitedStoreOwnerData } from "@Types/Schema/Users/StoreOwner";
import { addDays } from "date-fns";
import mongoose from "mongoose";

async function createUnlimitedStoreOwner(unlimitedStoreOwnerData: UnlimitedStoreOwnerData, unlimitedPlan: Pick<PlanDocument, "planName" | "id" | "price">, session: mongoose.ClientSession) {
  const { id, planName, price } = unlimitedPlan;

  const storeOwnerData = {
    userType: "storeOwner",
    email: unlimitedStoreOwnerData.email,
    subscriptionType: unlimitedStoreOwnerData.subscriptionType,
    ...(unlimitedStoreOwnerData.firstName && { firstName: unlimitedStoreOwnerData.firstName }),
    ...(unlimitedStoreOwnerData.lastName && { lastName: unlimitedStoreOwnerData.lastName }),
    ...(unlimitedStoreOwnerData.password && { credentials: { password: unlimitedStoreOwnerData.password } }),
    ...(unlimitedStoreOwnerData.password && { signMethod: "credentials" }),
  } as UnlimitedStoreOwnerData;

  const subscribeStarts = new Date();
  const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD);

  const data = {
    ...storeOwnerData,
    subscribedPlanDetails: {
      planId: id,
      planName,
      paidPrice: price.riyal,
      subscribeStarts,
      subscribeEnds,
      paid: false,
    },
  };

  return await createNewUnlimitedUser(data, session);
}

export default createUnlimitedStoreOwner;
