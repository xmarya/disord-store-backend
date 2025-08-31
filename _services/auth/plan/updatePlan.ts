import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { PlanDataBody } from "@Types/Plan";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updatePlan(planId: string, updatedData:Partial<PlanDataBody>) {
  const safeUpdatePlan = safeThrowable(
    () => updateDoc(Plan, planId, updatedData),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(()=>safeUpdatePlan);
}

export default updatePlan;
