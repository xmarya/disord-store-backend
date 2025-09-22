import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import User from "@models/userModel";
import mongoose from "mongoose";


export async function createNewRegularUser(signupData: Omit<CredentialsSignupData, "password" | "passwordConfirm">, session: mongoose.ClientSession) {
  const newUser = await User.create([signupData], { session });

  return newUser[0];
}