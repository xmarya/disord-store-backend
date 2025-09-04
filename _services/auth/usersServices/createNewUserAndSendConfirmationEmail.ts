import eventBus from "@config/EventBus";
import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import getSignupFunctionOf from "@services/nonAuth/credentialsServices/signup/getSignupFunctionOf";
import { EmailConfirmationSentEvent, UserCreatedEvent } from "@Types/events/UserEvents";
import { CredentialsSignupData } from "@Types/SignupData";
import generateEmailConfirmationToken from "@utils/email/generateEmailConfirmationToken";
import { startSession } from "mongoose";

async function createNewUserAndSendConfirmationEmail(signupData: CredentialsSignupData, emailTokenGenerator: { hostname: string; protocol: string }) {
  const { firstName, lastName, email, userType } = signupData;
  const data = { firstName, lastName, email, signMethod: "credentials", userType };

  const signupFn = getSignupFunctionOf(userType);

  const session = await startSession();
  const { newUser, newCredentials } = await session.withTransaction(async () => {
    const newUser = await signupFn(data, session);
    const newCredentials = await createNewCredentials(signupData, session);

    return { newUser, newCredentials };
  });

  const { confirmUrl, randomToken } = await generateEmailConfirmationToken(newCredentials, emailTokenGenerator);

  const userCreatedEvent: UserCreatedEvent = {
    type: "user.created",
    payload: { user: newUser, credentialsId: newCredentials.id, confirmUrl, randomToken },
    occurredAt: new Date(),
  };
  eventBus.publish(userCreatedEvent);

  const emailSentEvent: EmailConfirmationSentEvent = {
    type: "emailConfirmation.sent",
    payload: {
      credentialsId: newCredentials.id,
      userType: newCredentials.userType,
      randomToken,
    },
    occurredAt: new Date(),
  };

  eventBus.publish(emailSentEvent);

  return newUser;
}

export default createNewUserAndSendConfirmationEmail;
