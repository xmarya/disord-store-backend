import mongoose from "mongoose";
import { UserTypes } from "../User";

export interface AdminDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  credentials: {
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    passwordChangedAt: Date;
  };
  userType: Extract<UserTypes, "admin">;
  image:string
}
