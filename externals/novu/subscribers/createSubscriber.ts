import novu from "@config/novu";
import { AdminDocument } from "@Types/admin/AdminUser";
import { MongoId } from "@Types/MongoId";
import { AssistantPermissions } from "@Types/StoreAssistant";
import { UserDocument } from "@Types/User";

export async function novuCreateAssistantSubscriber(user: UserDocument, store: MongoId, permissions: AssistantPermissions) {
  const { id, firstName, lastName, userType, email, phoneNumber } = user;
  await novu.subscribers.create({
    subscriberId: id,
    firstName,
    lastName,
    email: "shhmanager1@gmail.com",
    phone: phoneNumber,
    data: {
      userType,
      store,
      permissions,
    },
  });
}

export default novuCreateAssistantSubscriber;