import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";
import { setCompressedCacheData } from "./globalCache";

async function cacheUser(user: UserDocument | AdminDocument) {
  const data = {
    id: user.id,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
    email: user.email,
    emailConfirmed: user.credentials.emailConfirmed,
    ...(user.userType === "storeOwner" && { subscribedPlanDetails: user.subscribedPlanDetails, myStore: user.myStore }),
    // TRANSLATE: the reason behind HOW TS COULD INFER THE RIGHT PART IN THE LINE ABOVE once I did user.userType === "storeOwner"
    // is because in AdminDocument I did explicitly set the userType to be "admin".
    // so, if the user.userType === "storeOwner" is true, then that denies the possibility of the user being of type AdminDocument,
    // leaving us with the other type
  };

  // console.log("data before setCachedData", data);

  await setCompressedCacheData(`User:${data.id}`, data, "one-hour");
}

export default cacheUser;
