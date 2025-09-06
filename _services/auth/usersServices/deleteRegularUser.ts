import { deleteRegularUser as deleteRegular } from "@repositories/user/userRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function deleteRegularUser(userId: string) {

  const safeDeleteRegular = safeThrowable(
    () => deleteRegular(userId),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeDeleteRegular);

}

export default deleteRegularUser;
