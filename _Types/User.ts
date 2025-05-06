import mongoose from "mongoose";
import { Address } from "./UserAddress";
import { BankAccount } from "./UserBankAccount";
import { PlansNames } from "./Plan";

type Credentials = {
  firstName:string,
  lastName:string,
  password: string;
  passwordConfirm: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  passwordChangedAt: Date;
}

type Discord = {
  discordId: string;
  name:string,
  username: string;
  image: string;
}

export type UserTypes = "user" | "storeOwner" | "storeAssistant" | "admin"

export interface UserDataBody {
  email: string;
  credentials: Credentials;
  discord: Discord;
}

export interface RegularUser extends UserDataBody {
  signMethod: "credentials" | "discord";
  userType: UserTypes;
  firstName:string,
  lastName:string,
  phoneNumber:string,
  image: string;
  addresses: Array<Address>,
  bankAccounts: Array<BankAccount>,
  defaultAddressId: mongoose.Types.ObjectId,
  defaultBankAccountId: mongoose.Types.ObjectId,
  createdAt: Date;
}

type UserPlan = {
  planId: mongoose.Types.ObjectId | string,
  planName: PlansNames
  paid:boolean,
  subscribeStarts: Date;
  subscribeEnds: Date;
}

export interface StoreOwner extends RegularUser {
  myStore: mongoose.Types.ObjectId | string;
  subscribedPlanDetails: UserPlan;
  pastSubscriptions?: 
    {
      plan: mongoose.Types.ObjectId | string;
      count: number;
    }[];
}

export interface UserMethods {comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
  generateRandomToken: () => Promise<string>
}

export type UserDocument = RegularUser & StoreOwner & UserPlan & UserMethods & mongoose.Document;
