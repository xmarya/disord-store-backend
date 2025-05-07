import mongoose from "mongoose";
import { UnlimitedPlanDataBody } from "../../_Types/Plan";
import Plan from "../../models/planModel";

export async function createUnlimitedPlan(data:UnlimitedPlanDataBody, session:mongoose.ClientSession) {
    const newPlan = await Plan.create([data], {session});

    return newPlan[0];
}

export async function checkPlanName(id:string):Promise<boolean> {
    const isUnlimited = await Plan.exists({_id:id, planName: "unlimited"});
    
    return !!isUnlimited;
}