import { updatePlanMonthlyStats } from "@repositories/plan/planRepo";
import { PlanSubscriptionUpdatedEvent } from "@Types/events/PlanSubscriptionEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updatePlanStatsConsumer(event: PlanSubscriptionUpdatedEvent) {
  const { planName, profit, subscriptionType } = event.payload;

  const safeUpdatePlan = safeThrowable(
    () => updatePlanMonthlyStats(planName, profit, subscriptionType),
    (error) => new Failure((error as Error).message)
  );

  const updatePlanResult = await extractSafeThrowableResult(() => safeUpdatePlan);

  if (!updatePlanResult.ok) return new Failure(updatePlanResult.message, { serviceName: "planStatsCollection", ack: false });

  return new Success({ serviceName: "planStatsCollection", ack: true });
}

export default updatePlanStatsConsumer;
