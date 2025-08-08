import novu from "../../../_config/novu";
import { AdminDocument } from "../../../_Types/admin/AdminUser";
import { UserDocument } from "../../../_Types/User";

async function sendWelcome(workflowId: "welcome-store-owner" | "welcome-general", user: UserDocument | AdminDocument, emailConfirmationToken:string) {
  const { id, firstName, lastName, image, userType, email, phoneNumber } = user;
  await novu.trigger({
    workflowId,
    to: {
      subscriberId: id,
      firstName,
      lastName,
      email,
      phone: phoneNumber ?? undefined,
      data: {
        userType
      }
    },
    payload: {
        emailConfirmationToken
    },
  });

}



export default sendWelcome;
