import mongoose, { Types } from "mongoose";
import { Plan } from "./Plan";

export interface Credentials {
  password: string;
  passwordConfirm?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
}

export interface Discord {
  id: string;
}

export type UserTypes = "user" | "storeOwner" | "storeAssistant" | "admin"

export interface UserDataBody {
  email: string;
  credentials?: Credentials;
  discord?: Discord;
  username: string;
  image: string;
}

export interface UserBasic extends UserDataBody {
  id: string;
  signMethod: "credentials" | "discord";
  userType: UserTypes;
  createdAt: Date;
}

export interface UserPlan extends Plan {
  subscribeStarts?: Date;
  subscribeEnds?: Date;
}

export interface UserOptionals {
  bankAccount?:
    {
      cardName: string;
      cardNumber: string;
      cardExpireIn: {
        month: string;
        year: string;
      };
    }[];
  subscribedPlanDetails?: UserPlan;
  pastSubscriptions?: 
    {
      plan: string;
      count: number;
    }[];
  myStore?: Types.ObjectId | string;
}

export interface UserMethods {comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
  generateRandomToken: () => Promise<string>
}

export type UserDocument = UserBasic & UserOptionals & UserPlan & UserMethods & mongoose.Document;
