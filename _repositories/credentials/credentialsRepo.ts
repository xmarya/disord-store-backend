import Credentials from "@models/credentialsModel";
import { MongoId } from "@Types/Schema/MongoId";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import mongoose from "mongoose";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";

export async function createNewCredentials(credentialsData: Omit<CredentialsSignupData, "passwordConfirm">, session: mongoose.ClientSession) {
  const {email, userType} = credentialsData;
  const newCredentials = await Credentials.findOneAndUpdate({email, userType}, credentialsData, {upsert:true, new: true, runValidators:true}).session(session);
  return newCredentials;
}
export async function getCredentials(condition: QueryOptions<CredentialsDocument>["condition"]) {
  const fields: QueryOptions<CredentialsDocument>["select"] = ["password", "userType", "email", "phoneNumber", "emailConfirmed"];
  return await Credentials.findOne(condition).select(fields);
}

export async function updateEmail(oldEmail:string, newEmail:string, session: mongoose.ClientSession) {
  // TODO: changing the email resets the emailConfirmed to false
  return await Credentials.findOneAndUpdate({email: oldEmail}, {email: newEmail, emailConfirmed:false}, {new:true, runValidators:true, session});
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
