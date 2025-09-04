import Credentials from "@models/credentialsModel";
import { MongoId } from "@Types/MongoId";
import { QueryOptions } from "@Types/QueryOptions";
import { CredentialsSignupData } from "@Types/SignupData";
import { UserTypes } from "@Types/User";
import { CredentialsDocument, LoginMethod } from "@Types/UserCredentials";
import mongoose from "mongoose";

export async function createNewCredentials(credentialsData: CredentialsSignupData, session: mongoose.ClientSession) {
  const newCredentials = await Credentials.create([credentialsData], { session }); // in case the create must accept a session option, the data must be inside [], for mongoose not to mistake the {session} as another document

  return newCredentials[0];
}
export async function getCredentials(loginMethod: LoginMethod) {
  const fields: QueryOptions<CredentialsDocument>["select"] = ["password", "userType", "email", "phoneNumber"];
  return await Credentials.findOne(loginMethod).select(fields);
}
export async function updatePassword(email: string, newPassword: string) {
  return await Credentials.findOneAndUpdate({ email }, { password: newPassword });
}
export async function updateEmail(session: mongoose.ClientSession) {}

export async function deleteCredentials(session: mongoose.ClientSession) {}

export async function getResetPasswordCredentials(hashedToken: string) {
  return await Credentials.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: new Date() } });
}

export async function isEmailExist(email: string) {
  return !!(await Credentials.exists({ email }));
}

export async function confirmUserEmail(credentialsId: MongoId, hashedToken: string, userType: UserTypes) {
  return await Credentials.findOneAndUpdate(
    {
      _id: credentialsId,
      emailConfirmationToken: hashedToken,
      userType,
    },
    {
      $unset: {
        emailConfirmationToken: "",
        emailConfirmationExpires: "",
      },
      $set: {
        emailConfirmed: true,
      },
    }
  );
}
