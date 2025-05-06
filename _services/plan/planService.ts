import mongoose from "mongoose";
import { UnlimitedPlanDataBody } from "../../_Types/Plan";
import Plan from "../../models/planModel";

export async function createUnlimitedPlan(data:UnlimitedPlanDataBody, session:mongoose.ClientSession) {
    const newPlan = await Plan.create([data], {session});

    return newPlan[0];
}