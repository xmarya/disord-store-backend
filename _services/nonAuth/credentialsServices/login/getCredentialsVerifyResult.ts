import { getCredentials } from "@repositories/credentials/credentialsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Unauthorised } from "@Types/ResultTypes/errors/Unauthorised";
import { Success } from "@Types/ResultTypes/Success";
import { LoginMethod } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import { comparePasswords } from "@utils/passwords/comparePasswords";
import safeThrowable from "@utils/safeThrowable";
import loginFactory from "./loginFactory";
import { UserLoggedInEvent } from "@Types/events/UserEvents";
import eventBus from "@config/EventBus";

async function getCredentialsVerifyResult(loginMethod: LoginMethod, password: string) {
  // STEP 1) get the credentials depending on the login method:
  const safeGetCredentials = safeThrowable(
    () => getCredentials(loginMethod),
    (error) => new Failure((error as Error).message)
  );

  const getCredentialsResult = await extractSafeThrowableResult(() => safeGetCredentials);
  if (!getCredentialsResult.ok) return getCredentialsResult;

  const {
    result: { userType, password: userPassword, emailConfirmed },
  } = getCredentialsResult;
  if (!(await comparePasswords(password, userPassword))) return new Unauthorised("الرجاء التحقق من البيانات المدخلة");

  const loggedInUser = await loginFactory(userType, loginMethod);
  if (!loggedInUser.ok) return loggedInUser;

  const event: UserLoggedInEvent = {
    type: "user-loggedIn",
    payload: {
      user: loggedInUser.result,
      emailConfirmed,
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return new Success({ loggedInUser: loggedInUser.result, emailConfirmed });
}

export default getCredentialsVerifyResult;
