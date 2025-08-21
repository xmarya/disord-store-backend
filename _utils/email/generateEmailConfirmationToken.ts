import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";
import { generateRandomToken } from "../generateRandomToken";

async function generateEmailConfirmationToken(user: UserDocument | AdminDocument, emailTokenGenerator: {hostname:string, protocol:string}) {
  const randomToken = await generateRandomToken(user, "emailConfirmation");
  const confirmUrl = `${emailTokenGenerator.protocol}://${emailTokenGenerator.hostname}/api/v1/auth/confirmEmail/${randomToken}`;

  return confirmUrl;
}

export default generateEmailConfirmationToken;
