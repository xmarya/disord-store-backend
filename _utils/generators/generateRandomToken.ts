import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import crypto from "crypto";
import { addMinutes } from "date-fns";

export async function generateRandomToken(credentials: CredentialsDocument, tokenFor: "forgetPassword" | "emailConfirmation") {
  // STEP 1) Generate the token:
  const randomToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");
  //STEP 2) set an expiring time for the GRT:
  //   const tokenExpiresIn = new Date(Date.now() + 15 * 60 * 1000); // lasts for 15 minutes.
  // const tokenExpiresIn = addMinutes(new Date(), 15);

  if (tokenFor === "forgetPassword") {
    //STEP 3) store the token after hashing/expiring time in credentials:
    credentials.passwordResetToken = hashedToken;
    credentials.passwordResetExpires = addMinutes(new Date(), 15);
  } else {
    credentials.emailConfirmationToken = hashedToken;
    credentials.emailConfirmationExpires = addMinutes(new Date(), 60);
  }

  //STEP 4) saving the changes without validation as I'm not saving any critical data:
  await credentials.save({ validateBeforeSave: false });

  return randomToken;
}
