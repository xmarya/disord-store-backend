import { AdminDocument } from "../../_Types/admin/AdminUser";
import { UserDocument } from "../../_Types/User";
import { setCachedData } from "./globalCache";

async function cacheUser(user: UserDocument | AdminDocument) {
  const data = {
    id: user.id,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    ...(user.userType === "storeOwner" && { emailConfirmed: user.credentials.emailConfirmed, subscribedPlanDetails: user.subscribedPlanDetails, discord: user.discord, myStore: user?.myStore }),
    // TRANSLATE: the reason behind HOW TS COULD INFER THE RIGHT PART IN THE LINE ABOVE once I did user.userType === "storeOwner"
    // is because in AdminDocument I did explicitly set the userType to be "admin".
    // so, if the user.userType === "storeOwner" is true, then that denies the possibility of the user being of type AdminDocument,
    // leaving us with the other type
  };

  console.log("data before setCachedData", data);

  setCachedData(`User:${data.id}`, data, "user-ttl");
}

export default cacheUser;
