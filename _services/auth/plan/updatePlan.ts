import Plan from "@models/planModel";
import { updateDoc } from "@repositories/global";
import { PlanDataBody } from "@Types/Schema/Plan";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updatePlan(planId: string, updatedData: Partial<PlanDataBody>) {
  const safeUpdatePlan = safeThrowable(
    () => updateDoc(Plan, planId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdatePlan);
}

export default updatePlan;
