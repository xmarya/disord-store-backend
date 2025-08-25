import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { updatePlanMonthlyStats } from "@repositories/plan/planRepo";
import createNewUnlimitedPlan from "@services/planServices/createNewUnlimitedPlan";
import createUnlimitedStoreOwner from "@services/usersServices/storeOwnerServices.ts/createUnlimitedStoreOwner";
import { MongoId } from "@Types/MongoId";
import { UnlimitedPlanDataBody } from "@Types/Plan";
import { CredentialsSignupData } from "@Types/SignupData";
import { UnlimitedStoreOwnerData } from "@Types/User";
import { startSession } from "mongoose";
import { err } from "neverthrow";

async function createUnlimitedPlanAndStoreOwner(unlimitedPlanDetails: Omit<UnlimitedPlanDataBody, "planName">, storeOwnerData: UnlimitedStoreOwnerData) {
  const session = await startSession();

  let newUnlimitedStoreOwner
  try {
    session.startTransaction();
    const newUnlimitedPlan = await createNewUnlimitedPlan({ planName: "unlimited", ...unlimitedPlanDetails }, session);
    newUnlimitedStoreOwner = await createUnlimitedStoreOwner(storeOwnerData, newUnlimitedPlan, session);
    
    /*inside event?*/ // STEP 3) link the plan to the user:
    await updateDoc(Plan, newUnlimitedPlan._id as MongoId, { unlimitedUser: newUnlimitedStoreOwner._id }, { session });
    
    // STEP 4) update the plans stats:
    const { subscriptionType } = storeOwnerData;
    await updatePlanMonthlyStats("unlimited", unlimitedPlanDetails.price.riyal, subscriptionType, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log("createUnlimitedStoreOwner ERROR", error);
    err(INTERNAL_ERROR_MESSAGE);
  } finally {
    await session.endSession();
  }

  return {email: newUnlimitedStoreOwner?.email, subscribedPlanDetails: newUnlimitedStoreOwner?.subscribedPlanDetails};
}

export default createUnlimitedPlanAndStoreOwner;
