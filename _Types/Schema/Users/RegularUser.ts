import mongoose from "mongoose";
import { MongoId } from "../MongoId";
import { BaseUserData, UserTypes } from "./BasicUserTypes";

type Discord = {
  discordId: string;
  name: string;
  username: string;
  image: string;
};

export interface RegularUser extends BaseUserData {
  userType: Extract<UserTypes, "user">;
  email: string;
  discord: Discord;
  signMethod: "credentials" | "discord";
  firstName: string;
  lastName: string;
  phoneNumber: `+966${string}`;
  avatar: string;
  defaultAddressId: MongoId;
  defaultCreditCardId: MongoId;
  createdAt: Date;
}


/* OLD CODE (kept for reference): 
  export interface UserMethods {
    comparePasswords: (providedPassword: string, userPassword: string) => Promise<boolean>;
    generateRandomToken: () => Promise<string>;
}
*/

export type RegularUserDocument = RegularUser & mongoose.Document;
