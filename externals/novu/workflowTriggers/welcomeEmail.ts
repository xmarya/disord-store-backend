import novu from "@config/novu";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";

async function novuSendWelcome(workflowId: "welcome-admin" | "welcome-store-owner" | "welcome-general", user: UserDocument | AdminDocument, emailConfirmationToken?: string) {
  const { id, firstName, lastName, userType, email, phoneNumber } = user;
  await novu.trigger({
    workflowId,
    to: {
      subscriberId: id,
      firstName,
      lastName,
      email: "shhmanager1@gmail.com" /* CHANGE LATER: to actual user email */,
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
