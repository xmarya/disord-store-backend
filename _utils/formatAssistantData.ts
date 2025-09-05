import { AssistantPermissions, StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";

function formatAssistantData(permissions: AssistantPermissions, otherData: StoreAssistantDocument) {
  const { _id, id, firstName, lastName, email, phoneNumber, image, userType } = otherData;
  return {
    _id,
    id,
    firstName,
    lastName,
    email,
    phoneNumber,
    image,
    userType,
    permissions,
  };
}

export default formatAssistantData;
