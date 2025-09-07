import { MongoId } from "../MongoId";

export type UserTypes = "user" | "storeOwner" | "storeAssistant" | "admin";

export interface BaseUserData {
  userType:UserTypes
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: `+966${string}`;
  image: string;
  defaultAddressId: MongoId;
  defaultCreditCardId: MongoId;
}
