import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { UserTypes } from "@Types/User";
import { LoginMethod } from "@Types/UserCredentials";
import loginRegularUser from "./loginRegularUser";
import loginStoreAssistant from "./loginStoreAssistant";
import loginAdmin from "./loginAdmin";

async function loginFactory(userType: UserTypes, loginMethod: LoginMethod) {
  switch (userType) {
    case "user":
    case "storeOwner":
      return await loginRegularUser(loginMethod);

    case "storeAssistant":
      return await loginStoreAssistant(loginMethod);

    case "admin":
      return await loginAdmin(loginMethod)

    default:
      return new BadRequest("لم يتم العثور على المستخدم المطلوب");
  }
}

export default loginFactory;
