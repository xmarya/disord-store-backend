import getAdminProfile from "@services/auth/adminServices/adminAuth/getAdminProfile";
import getStoreOwnerProfile from "@services/auth/storeOwnerServices/getStoreOwnerProfile";
import getAssistantProfile from "@services/auth/storeOwnerServices/storeAssistant/getAssistantProfile";
import getUserProfile from "@services/auth/usersServices/getUserProfile";
import { MongoId } from "@Types/Schema/MongoId";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";

async function getProfileFactory(id: MongoId, userType: UserTypes) {
  let result;
  switch (userType) {
    case "admin":
      result = await getAdminProfile(id);
      break;
    case "storeOwner":
      result = await getStoreOwnerProfile(id);
      break;
    case "storeAssistant":
      result = await getAssistantProfile(id);
      break;
    default:
      result = await getUserProfile(id);
      break;
  }

  return result;
}

export default getProfileFactory;
