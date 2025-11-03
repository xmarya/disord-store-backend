import User from "@models/userModel";
import { getAllDocs } from "@repositories/global";
import { QueryParams } from "@Types/helperTypes/Request";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getAllUsersForAdmin(query: QueryParams) {
  const safeGetAllUsers = safeThrowable(
    () => getAllDocs(User, query, { select: ["firstName", "lastName", "email", "avatar", "userType"] }),
    (error) => new Failure((error as Error).message)
  );

  const formattedResult = await extractSafeThrowableResult(() => safeGetAllUsers);

  return formattedResult;
}

export default getAllUsersForAdmin;
