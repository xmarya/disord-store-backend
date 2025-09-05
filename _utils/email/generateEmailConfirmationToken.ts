import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import { generateRandomToken } from "../generateRandomToken";

export async function generateEmailConfirmationToken(credentials: CredentialsDocument, emailTokenGenerator: { hostname: string; protocol: string }) {
  const randomToken = await generateRandomToken(credentials, "emailConfirmation");
  const confirmUrl = `${emailTokenGenerator.protocol}://${emailTokenGenerator.hostname}/api/v1/auth/confirmEmail/${randomToken}`;

  return { confirmUrl, randomToken };
}

export default generateEmailConfirmationToken;
