import { MongoId } from "@Types/Schema/MongoId";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import User from "@models/userModel";
import mongoose from "mongoose";


export async function createNewRegularUser(signupData: Omit<CredentialsSignupData, "password" | "passwordConfirm">, session: mongoose.ClientSession) {
  const newUser = await User.create([signupData], { session });

  return newUser[0];
}

export async function deleteRegularUser(userId:MongoId, session:mongoose.ClientSession) {
  return await User.findByIdAndUpdate(userId,{
    $set: {
      status:"deleted",
      firstName:"deleted user",
      image:"default.jpge"
    },
    $unset: {
      email:"",
      lastName:"",
      defaultAddressId:"",
      defaultCreditCardId:"",
      discord:"",
      signMethod:"",
      phoneNumber:"",

    }
  }, {new: true, runValidators:false, session})
}