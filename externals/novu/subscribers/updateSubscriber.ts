import novu from "../../../_config/novu";
import { AssistantPermissions } from "../../../_Types/StoreAssistant";

type NovuUpdatedData = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  store?: string;
  permissions?: AssistantPermissions;
};

async function novuUpdateSubscriber(subscriberId: string, data: NovuUpdatedData) {
  const payload: Record<string, any> = {
    ...(data.email && { email: data.email }),
    ...(data.firstName && { firstName: data.firstName }),
    ...(data.lastName && { lastName: data.lastName }),
    ...(data.phoneNumber && { phone: data.phoneNumber }),
  };

  const moreData = {
    ...(data.store && { store: data.store }),
    ...(data.permissions && { permissions: data.permissions }),
  };

  if (Object.keys(moreData).length) payload.data = moreData;

  const result = await novu.subscribers.patch(payload, subscriberId);

  console.log("whatnovuUpdateSubscriber", result);
}

export default novuUpdateSubscriber;
