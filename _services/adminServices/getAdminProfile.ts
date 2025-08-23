import Admin from "@models/adminModel";
import { getOneDocById } from "@repositories/global";
import { AdminDocument } from "@Types/admin/AdminUser";
import { QueryOptions } from "@Types/QueryOptions";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAdminProfile(adminId: string) {
  const fields: QueryOptions<AdminDocument>["select"] = ["firstName", "lastName", "email", "image"];
  const safeGetAdminProfile = safeThrowable(
    () => getOneDocById(Admin, adminId, { select: fields }),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );

  const adminProfile = await extractSafeThrowableResult(() => safeGetAdminProfile);

  return adminProfile;
}

export default getAdminProfile;
