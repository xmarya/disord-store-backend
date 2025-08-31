import { PLAN_TRIAL_PERIOD } from "@constants/ttl";
import { addDays, isPast } from "date-fns";



const isTrialOver = (subscriptionStartDate:Date) => isPast(addDays(subscriptionStartDate, PLAN_TRIAL_PERIOD));

export default isTrialOver;