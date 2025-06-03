import crypto from "crypto";
import bcrypt from "bcryptjs";
import { addMinutes } from "date-fns";
import { UserDocument } from "../_Types/User";
import { AdminDocument } from "../_Types/admin/AdminUser";

export async function comparePasswords(providedPassword: string, userPassword:string) {  /*✅*/
    const result = await bcrypt.compare(providedPassword, userPassword);
    return result;
}

export async function generateRandomToken(doc: UserDocument | AdminDocument) {
  // STEP 1) Generate the token:
  const randomToken = crypto.randomBytes(32).toString("hex");

  //STEP 2) set an expiring time for the GRT:
  //   const tokenExpiresIn = new Date(Date.now() + 15 * 60 * 1000); // lasts for 15 minutes.
  const tokenExpiresIn = addMinutes(new Date(), 15);

  //STEP 3) store the token after hashing/expiring time in credentials:
  doc.credentials.passwordResetToken = randomToken;
  doc.credentials.passwordResetExpires = tokenExpiresIn;

  //STEP 4) saving the changes:
  await doc.save({ validateBeforeSave: true });

  return randomToken;
}
