import Admin from "@models/adminModel";
import { updateDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import mongoose from "mongoose";

async function updateAdminProfile(adminId: string, updatedData: Partial<BaseUserData>, session?:mongoose.ClientSession) {
  const safeUpdatedAdmin = safeThrowable(
    () => updateDoc(Admin, adminId, updatedData, {session}),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdatedAdmin);
}

export default updateAdminProfile;
