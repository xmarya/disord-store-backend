import Admin from "@models/adminModel";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import mongoose from "mongoose";

export async function createNewAdmin(signupData: Omit<CredentialsSignupData, "password" | "passwordConfirm">, session: mongoose.ClientSession) {
  const newAdmin = await Admin.create([signupData], { session });

  return newAdmin[0];
}

export async function confirmAdminEmail(bulkOps: any) {
  await Admin.bulkWrite(bulkOps);
}
