import getAdminEmail from "@services/adminServices/getAdminEmail";
import getUserEmail from "@services/usersServices/getUserEmail";
import { MongoId } from "@Types/MongoId";
import { UserTypes } from "@Types/User";
import { err } from "neverthrow";

async function emailChecker(userId: MongoId, userType: UserTypes, email: string) {
  let isEmailExits: boolean;

  switch (userType) {
    case "admin":
      isEmailExits = await getAdminEmail(userId, email);
      break;

    default:
      isEmailExits = await getUserEmail(userId, email);
      break;
  }

  if (isEmailExits) return err("لا يمكن استخدام هذا البريد الإلكتروني");

  return isEmailExits;
}

export default emailChecker;
