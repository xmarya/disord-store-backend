import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Plan from "@models/planModel";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlan(planId: string) {
  const safeGetPlan = safeThrowable(
    () => getOneDocById(Plan, planId),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(()=>safeGetPlan);
}

export default getOnePlan;
