import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import getSignupFunctionOf from "@services/nonAuth/credentialsServices/signup/getSignupFunctionOf";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import generateEmailConfirmationToken from "@utils/generators/generateEmailConfirmationToken";
import { startSession } from "mongoose";
import createCredentialsAndEmailConfirmation from "./createCredentialsAndEmailConfirmation";

async function signupNewUserAndSendConfirmationEmail(signupData: CredentialsSignupData, emailTokenGenerator: { hostname: string; protocol: string }) {
  const { firstName, lastName, email, userType, phoneNumber } = signupData;
  const data = { firstName, lastName, email, signMethod: "credentials", userType, phoneNumber };

  const signupFn = getSignupFunctionOf(userType);

  const session = await startSession();
  const { newUser } = await session.withTransaction(async () => {
    const newUser = await signupFn(data, session);
    const result = await createCredentialsAndEmailConfirmation(signupData, session, emailTokenGenerator);
    if (result.ok) {
      const {
        result: { credentialsId, confirmUrl, randomToken },
      } = result;
      await createOutboxRecord<[UserCreatedEvent]>([{ type: "user-created", payload: { user: newUser, credentialsId, confirmUrl, randomToken } }], session);
    }
    return { newUser };
  });

  return newUser;
}

export default signupNewUserAndSendConfirmationEmail;
