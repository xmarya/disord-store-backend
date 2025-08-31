import eventBus from "@config/EventBus";
import Admin from "@models/adminModel";
import { createDoc } from "@repositories/global";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { CredentialsSignupData } from "@Types/SignupData";
import generateEmailConfirmationToken from "@utils/email/generateEmailConfirmationToken";

async function createNewAdmin(signupData: Omit<CredentialsSignupData, "userType">, emailTokenGenerator: { hostname: string; protocol: string }) {
  const { email, firstName, lastName, password } = signupData;
  const data = { firstName, lastName, email, signMethod: "credentials", userType: "admin", credentials: { password } };
  const newAdmin = await createDoc(Admin, data);

  const confirmUrl = await generateEmailConfirmationToken(newAdmin, emailTokenGenerator);

  const event: UserCreatedEvent = {
    type: "user.created",
    payload: { user: newAdmin, confirmUrl },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  newAdmin.credentials!.password = "";
  newAdmin.credentials!.emailConfirmationToken = "";
  newAdmin.credentials!.emailConfirmationExpires = null;

  return newAdmin;
}

export default createNewAdmin;
