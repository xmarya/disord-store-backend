import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import getSignupFunctionOf from "@services/nonAuth/credentialsServices/signup/getSignupFunctionOf";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import generateEmailConfirmationToken from "@utils/generators/generateEmailConfirmationToken";
import { startSession } from "mongoose";

async function signupNewUserAndSendConfirmationEmail(signupData: CredentialsSignupData, emailTokenGenerator: { hostname: string; protocol: string }) {
  const { firstName, lastName, email, userType, phoneNumber } = signupData;
  const data = { firstName, lastName, email, signMethod: "credentials", userType, phoneNumber };

  const signupFn = getSignupFunctionOf(userType);

  const session = await startSession();
  const { newUser, newCredentials } = await session.withTransaction(async () => {
    const newUser = await signupFn(data, session);
    const newCredentials = await createNewCredentials(signupData, session);
    // confirmUrl for novu, randomToken from redis
    const { confirmUrl, randomToken } = await generateEmailConfirmationToken(newCredentials, emailTokenGenerator); // FIX remove it from here after testing
    await createOutboxRecord<UserCreatedEvent>("user-created", { user: newUser, credentialsId: newCredentials.id, confirmUrl, randomToken }, session)
    return { newUser, newCredentials };
  });

  return newUser;
}

export default signupNewUserAndSendConfirmationEmail;
