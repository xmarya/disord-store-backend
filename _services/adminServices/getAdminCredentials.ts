import Admin from "@models/adminModel";
import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { getOneDocById } from "@repositories/global";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAdminCredentials(adminId: string) {
  const safeGetAdmin = safeThrowable(
    () => getOneDocById(Admin, adminId, { select: ["credentials"] }),
    () => new Error(INTERNAL_ERROR_MESSAGE)
  );

  return await extractSafeThrowableResult(() => safeGetAdmin);
}

export default getAdminCredentials;
