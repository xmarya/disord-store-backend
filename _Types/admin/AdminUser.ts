import mongoose from "mongoose";
import { UserTypes } from "../User";
import { Credentials } from "../UserCredentials";

export interface AdminDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  credentials: Credentials;
  userType: Extract<UserTypes, "admin">;
  image:string
}
