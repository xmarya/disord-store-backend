import crypto from "crypto";
import { addMinutes } from "date-fns";
import { UserDocument } from "../_Types/User";
import { AdminDocument } from "../_Types/admin/AdminUser";

export async function generateRandomToken(doc: UserDocument | AdminDocument, tokenFor: "forgetPassword" | "emailConfirmation") {
  // STEP 1) Generate the token:
  const randomToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");
  //STEP 2) set an expiring time for the GRT:
  //   const tokenExpiresIn = new Date(Date.now() + 15 * 60 * 1000); // lasts for 15 minutes.
  const tokenExpiresIn = addMinutes(new Date(), 15);

  if (tokenFor === "forgetPassword") {
    //STEP 3) store the token after hashing/expiring time in credentials:
    doc.credentials.passwordResetToken = hashedToken;
    doc.credentials.passwordResetExpires = tokenExpiresIn;
  }

  else {

    doc.credentials.emailConfirmationToken = hashedToken;
    doc.credentials.emailConfirmationExpires = tokenExpiresIn;
  }

  //STEP 4) saving the changes:
  await doc.save({ validateBeforeSave: true });

  return randomToken;
}
