import Admin from "@models/adminModel";
import { deleteDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteAdminAccount(adminId: MongoId) {

  const safeDeleteAdmin = safeThrowable(
    () => deleteDoc(Admin,adminId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteAdmin);

}

export default deleteAdminAccount;