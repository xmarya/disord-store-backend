import { createUnlimitedPlan } from "@repositories/plan/planRepo";
import { UnlimitedPlanDataBody } from "@Types/Schema/Plan";
import mongoose from "mongoose";

async function createNewUnlimitedPlan(unlimitedPlanDetails: UnlimitedPlanDataBody, session: mongoose.ClientSession) {
  return await createUnlimitedPlan(unlimitedPlanDetails, session);
}

export default createNewUnlimitedPlan;
