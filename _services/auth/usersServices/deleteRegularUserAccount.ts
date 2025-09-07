import { deleteRegularUser } from "@repositories/user/userRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteRegularUserAccount(userId: MongoId) {
  
  const safeDeleteRegular = safeThrowable(
    () => deleteRegularUser(userId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteRegular);

}

export default deleteRegularUserAccount;
