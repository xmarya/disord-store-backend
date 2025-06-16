import mongoose from "mongoose";
import { Address } from "./UserAddress";
import { BankAccount } from "./UserBankAccount";
import { PlansNames } from "./Plan";
import { MongoId } from "./MongoId";

type Credentials = {
  password: string;
  passwordConfirm: string;
  emailConfirmed: boolean;
  passwordResetToken: string;
  passwordResetExpires: Date;
  passwordChangedAt: Date;
};

type Discord = {
  discordId: string;
  name: string;
  username: string;
  image: string;
};

export type UserTypes = "user" | "storeOwner" | "storeAssistant" | "admin";

export interface UserDataBody {
  email: string;
  credentials: Credentials;
  discord: Discord;
}

export interface RegularUser extends UserDataBody {
  signMethod: "credentials" | "discord";
  userType: UserTypes;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  image: string;
  addresses: Array<Address>;
  bankAccounts: Array<BankAccount>;
  defaultAddressId: mongoose.Types.ObjectId;
  defaultBankAccountId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export type UserPlan = {
  planId: MongoId;
  planName: PlansNames;
  subscriptionType: "new" | "renewal" | "upgrade" | "downgrade";
  // originalPrice: number;
  paidPrice: number;
  paid: boolean;
  subscribeStarts: Date;
  subscribeEnds: Date;
};

export interface StoreOwner extends RegularUser {
  myStore: MongoId;
  subscribedPlanDetails: UserPlan;
  subscriptionsLog: Map<string, { planName: string; price: number }>;
}

/* OLD CODE (kept for reference): 
  export interface UserMethods {
    comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
    generateRandomToken: () => Promise<string>;
}
*/

// export type UserDocument = RegularUser & StoreOwner & UserPlan & UserMethods & mongoose.Document;
export type UserDocument = RegularUser & StoreOwner & UserPlan & mongoose.Document;
