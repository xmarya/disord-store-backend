import novu from "@config/novu";
import { MongoId } from "@Types/MongoId";
import { NovuSubscriberData } from "@Types/NovuSubscriberData";
import { AssistantPermissions } from "@Types/StoreAssistant";

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