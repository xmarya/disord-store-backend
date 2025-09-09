import novu from "@config/novu";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";

async function novuSendWelcome(workflowId: "welcome-admin" | "welcome-store-owner" | "welcome-general", user: NotAssistant, emailConfirmationToken?: string) {
  const { id, firstName, lastName, userType, email, phoneNumber } = user;
  await novu.trigger({
    workflowId,
    to: {
      subscriberId: id,
      firstName,
      lastName,
      email,
      phone: phoneNumber ?? undefined,
      data: {
        userType,
      },
    },
    payload: {
      emailConfirmationToken,
    },
  });

}

export default novuSendWelcome;
