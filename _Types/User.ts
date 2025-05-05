import mongoose from "mongoose";
import { Plan } from "./Plan";
import { Address } from "./UserAddress";
import { BankAccount } from "./UserBankAccount";

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

interface UserPlan extends Plan {
  subscribeStarts: Date;
  subscribeEnds: Date;
}

export interface StoreOwner extends RegularUser {
  myStore: mongoose.Types.ObjectId | string;
  subscribedPlanDetails: UserPlan;
  pastSubscriptions?: 
    {
      plan: string;
      count: number;
    }[];
}

// export interface UserOptionals {
//   subscribedPlanDetails?: UserPlan;
//   pastSubscriptions?: 
//     {
//       plan: string;
//       count: number;
//     }[];
//   myStore?: Types.ObjectId | string;
// }

export interface UserMethods {comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
  generateRandomToken: () => Promise<string>
}

export type UserDocument = RegularUser & StoreOwner & UserPlan & UserMethods & mongoose.Document;
