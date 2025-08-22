import eventBus from "@config/EventBus";
import User from "@models/userModel";
import { createDoc } from "@repositories/global";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { CredentialsSignupData } from "@Types/SignupData";
import { UserDocument } from "@Types/User";
import generateEmailConfirmationToken from "@utils/email/generateEmailConfirmationToken";

async function createNewUser(signupData: CredentialsSignupData, emailTokenGenerator: { hostname: string; protocol: string }) {
  const { firstName, lastName, email, password, userType } = signupData;
  const data = { firstName, lastName, email, signMethod: "credentials", userType, credentials: { password } };

  const newUser = await createDoc<UserDocument>(User, data);

  const confirmUrl = await generateEmailConfirmationToken(newUser, emailTokenGenerator);

   const event: UserCreatedEvent = {
    type: "user.created",
    payload: { user: newUser, confirmUrl},
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  newUser.credentials!.password = "";
  newUser.credentials!.emailConfirmationToken = "";
  newUser.credentials!.emailConfirmationExpires = null;

  return newUser;
}

export default createNewUser;
