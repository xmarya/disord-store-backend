import mongoose from "mongoose";
import { UserTypes } from "../BasicUserTypes";

export interface AdminDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: `+966${string}`;
  userType: Extract<UserTypes, "admin">;
  image: string;
}
