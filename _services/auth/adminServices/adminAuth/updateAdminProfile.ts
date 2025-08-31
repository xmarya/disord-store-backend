import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import Admin from "@models/adminModel";
import { updateDoc } from "@repositories/global";
import { AdminDocument } from "@Types/admin/AdminUser";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateAdminProfile(adminId: string, updatedData: Partial<AdminDocument>) {
  const safeUpdatedAdmin = safeThrowable(
    () => updateDoc(Admin, adminId, updatedData),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(() => safeUpdatedAdmin);

}

export default updateAdminProfile;
