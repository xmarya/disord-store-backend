import User from "@models/userModel";
import { getAllDocs } from "@repositories/global";
import { QueryParams } from "@Types/Request";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function getAllUsers(query: QueryParams) {
  const safeGetAllUsers = safeThrowable(
    () => getAllDocs(User, query ,{ select: ["firstName", "lastName", "email", "image", "userType"] }),
    () => new Error("something went wrong. please try again")
  );

  const formattedResult = await extractSafeThrowableResult(() => safeGetAllUsers);

  return formattedResult;
}

export default getAllUsers; 