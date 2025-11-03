import { UserTypes } from "./BasicUserTypes";

export type CredentialsSignupData = {
  userType: UserTypes;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phoneNumber?:`+966${string}`
};

export type DiscordSignupData = {
  email: string;
  id: string;
  name: string;
  avatar: string;
};
