import Plan from "@models/planModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlan(planId: MongoId) {
  const safeGetPlan = safeThrowable(
    () => getOneDocById(Plan, planId),
    (error) => new Error((error as Error).message)
  );

  return await extractSafeThrowableResult(()=>safeGetPlan);
}

export default getOnePlan;
