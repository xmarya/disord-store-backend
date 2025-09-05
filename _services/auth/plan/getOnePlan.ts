import Plan from "@models/planModel";
import { getOneDocById } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOnePlan(planId: MongoId) {
  const safeGetPlan = safeThrowable(
    () => getOneDocById(Plan, planId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetPlan);
}

export default getOnePlan;
