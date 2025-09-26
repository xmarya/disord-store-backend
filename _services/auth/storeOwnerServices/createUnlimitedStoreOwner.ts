import { SUBSCRIPTION_PERIOD } from "@constants/ttl";
import { createNewUnlimitedUser } from "@repositories/storeOwner/storeOwnerRepo";
import { PlanDocument } from "@Types/Schema/Plan";
import { UnlimitedStoreOwnerData } from "@Types/Schema/Users/StoreOwner";
import { addDays, lightFormat } from "date-fns";
import mongoose from "mongoose";

async function createUnlimitedStoreOwner(unlimitedStoreOwnerData: UnlimitedStoreOwnerData, unlimitedPlan: Pick<PlanDocument, "planName" | "id" | "price">, session: mongoose.ClientSession) {
  const { id, planName, price } = unlimitedPlan;
  const { email, firstName, lastName, subscriptionType, phoneNumber } = unlimitedStoreOwnerData;

  const subscribeStarts = new Date();
  const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD);
  const key = lightFormat(subscribeStarts, "yyyy-MM-dd");
  let logsMap: Map<string, { planName: string; price: number }> = new Map();
  logsMap.set(key, { planName, price: price.riyal });

  const data:Omit<UnlimitedStoreOwnerData, "password" |"image" | "myStore" | "defaultAddressId" | "defaultCreditCardId"> = {
    userType: "storeOwner",
    email,
    phoneNumber,
    subscriptionType,
    firstName,
    lastName,
    signMethod: "credentials",
    subscribedPlanDetails: {
      planId: id,
      planName,
      paidPrice: price.riyal,
      subscribeStarts,
      subscribeEnds,
      paid: true, /* CHANGE LATER: to false after payment gate integration */
    },
    subscriptionsLog: logsMap,
  };

  return await createNewUnlimitedUser(data, session);
}

export default createUnlimitedStoreOwner;
