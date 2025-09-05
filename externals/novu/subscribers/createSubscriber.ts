import novu from "@config/novu";
import { NovuSubscriberData } from "@Types/externalAPIs/NovuSubscriberData";
import { MongoId } from "@Types/Schema/MongoId";
import { AssistantPermissions } from "@Types/Schema/Users/StoreAssistant";

export async function novuCreateAssistantSubscriber(user: NovuSubscriberData, store: MongoId, permissions: AssistantPermissions) {
  const { id, firstName, lastName, email, userType, phoneNumber } = user;
  await novu.subscribers.create({
    subscriberId: id,
    firstName,
    lastName,
    email,
    phone: phoneNumber,
    data: {
      userType,
      store,
      permissions,
    },
  });
}

export default novuCreateAssistantSubscriber;
