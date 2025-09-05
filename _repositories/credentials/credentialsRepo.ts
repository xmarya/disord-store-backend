import Credentials from "@models/credentialsModel";
import { MongoId } from "@Types/Schema/MongoId";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import mongoose from "mongoose";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";

export async function createNewCredentials(credentialsData: CredentialsSignupData, session: mongoose.ClientSession) {
  const newCredentials = await Credentials.create([credentialsData], { session }); // in case the create must accept a session option, the data must be inside [], for mongoose not to mistake the {session} as another document

  return newCredentials[0];
}
export async function getCredentials(condition: QueryOptions<CredentialsDocument>["condition"]) {
  const fields: QueryOptions<CredentialsDocument>["select"] = ["password", "userType", "email", "phoneNumber", "emailConfirmed"];
  return await Credentials.findOne(condition).select(fields);
}

export async function updateEmail(session: mongoose.ClientSession) {
  // TODO: changing the email reset the emailConfirmed to false
  // TODO: downgrading the plan to basic deleting all the assistant data
}

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
