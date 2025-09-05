import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import loginRegularUser from "./loginRegularUser";
import loginStoreAssistant from "./loginStoreAssistant";
import loginAdmin from "./loginAdmin";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";

async function loginFactory(userType: UserTypes, loginMethod: LoginMethod) {
  switch (userType) {
    case "user":
    case "storeOwner":
      return await loginRegularUser(loginMethod);

    case "storeAssistant":
      return await loginStoreAssistant(loginMethod);

    case "admin":
      return await loginAdmin(loginMethod);

    default:
      return new BadRequest("لم يتم العثور على المستخدم المطلوب");
  }
}

export default loginFactory;
