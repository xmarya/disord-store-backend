import Admin from "@models/adminModel";
import { updateDoc } from "@repositories/global";
import { AdminDocument } from "@Types/admin/AdminUser";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateAdminProfile(adminId: string, updatedData: Partial<AdminDocument>) {
  const safeUpdatedAdmin = safeThrowable(
    () => updateDoc(Admin, adminId, updatedData),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdatedAdmin);

}

export default updateAdminProfile;
