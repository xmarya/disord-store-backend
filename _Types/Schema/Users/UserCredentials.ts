import mongoose from "mongoose";
import { UserTypes } from "./BasicUserTypes";

export type Credentials = {
  password: string;
  passwordConfirm: string;
  emailConfirmed: boolean;
  emailConfirmationToken: string;
  emailConfirmationExpires: Date | null;
  passwordResetToken: string;
  passwordResetExpires: Date;
  passwordChangedAt: Date;
};

export type LoginMethod = Record<"email", string> | Record<"phoneNumber", string>;

export type CredentialsLoginDataBody = {
  password: string;
  emailOrPhoneNumber: string;
};

export interface NewCredentials {
  email: string;
  phoneNumber: `+966${string}`;
  userType: UserTypes;
  password: string;
  emailConfirmed: boolean;
  emailConfirmationToken: string;
  emailConfirmationExpires: Date | null;
  passwordResetToken: string;
  passwordResetExpires: Date;
  passwordChangedAt: Date;
}

export interface CredentialsDocument extends NewCredentials, mongoose.Document {}
