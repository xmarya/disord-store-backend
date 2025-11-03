import updateAdminProfile from "@services/auth/adminServices/adminAuth/updateAdminProfile";
import updateStoreOwnerProfile from "@services/auth/storeOwnerServices/updateStoreOwnerProfile";
import updateUserProfile from "@services/auth/usersServices/updateUserProfile";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { BaseUserData, UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import mongoose from "mongoose";

const updateFn = {
  user: updateUserProfile,
  storeOwner: updateStoreOwnerProfile,
  admin: updateAdminProfile,

} satisfies Record<Exclude<UserTypes, "storeAssistant">, (id: MongoId, updatedData: Partial<Omit<BaseUserData, "email">>, session?: mongoose.ClientSession) => Promise<Failure | NotFound | Success<NotAssistant>>>;


function updateProfileFactory(userType: Exclude<UserTypes, "storeAssistant">) {
  return updateFn[userType];
}

export default updateProfileFactory;
