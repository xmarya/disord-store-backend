import mongoose from "mongoose";
import { Address } from "./UserAddress";
import { PlansNames, SubscriptionTypes } from "./Plan";
import { MongoId } from "./MongoId";
import { Credentials } from "./UserCredentials";

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
  phoneNumber: `+966${string}`;
  image: string;
  defaultAddressId: MongoId;
  defaultCreditCardId: MongoId;
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

export type UnlimitedStoreOwnerData = {
  userType: Extract<UserTypes, "storeOwner">;
  email: string;
  subscriptionType: Exclude<SubscriptionTypes, "downgrade">;
  firstName?: string;
  lastName?: string;
  password?: string;
  signMethod?: "credentials";
};

/* OLD CODE (kept for reference): 
  export interface UserMethods {
    comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
    generateRandomToken: () => Promise<string>;
}
*/

// export type UserDocument = RegularUser & StoreOwner & UserPlan & UserMethods & mongoose.Document;
export type UserDocument = RegularUser & StoreOwner & UserPlan & mongoose.Document;
