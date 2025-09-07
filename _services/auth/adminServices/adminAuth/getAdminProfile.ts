import Admin from "@models/adminModel";
import { getOneDocById } from "@repositories/global";
import { AdminDocument } from "@Types/Schema/Users/admin/AdminUser";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { MongoId } from "@Types/Schema/MongoId";

async function getAdminProfile(adminId: MongoId) {
  const fields: QueryOptions<AdminDocument>["select"] = ["firstName", "lastName", "email", "image", "userType"];
  const safeGetAdminProfile = safeThrowable(
    () => getOneDocById(Admin, adminId, { select: fields }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetAdminProfile);

}

export default getAdminProfile;
