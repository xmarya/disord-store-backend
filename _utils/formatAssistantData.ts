import { AssistantPermissions } from "@Types/StoreAssistant";
import { UserDocument } from "@Types/User";

function formatAssistantData(permissions: AssistantPermissions, otherData: UserDocument) {
  const {_id, id, firstName, lastName, email, phoneNumber, image, userType} = otherData;
  return {
    _id, id, firstName, lastName, email, phoneNumber, image, userType, permissions
  };
}

export default formatAssistantData;