import { SUBSCRIPTION_PERIOD } from "@constants/ttl";
import { addDays } from "date-fns";

function getSubscriptionStartAndEndDates() {
  const subscribeStarts = new Date();
  const subscribeEnds = addDays(subscribeStarts, SUBSCRIPTION_PERIOD);

  return {subscribeStarts, subscribeEnds}
}

export default getSubscriptionStartAndEndDates;
