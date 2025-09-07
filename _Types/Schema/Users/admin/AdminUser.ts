import mongoose from "mongoose";
import { Credentials } from "../UserCredentials";
import { UserTypes } from "../BasicUserTypes";

export interface AdminDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: `+966${string}`;
  credentials: Credentials;
  userType: Extract<UserTypes, "admin">;
  image: string;
}
