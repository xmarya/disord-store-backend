export type Credentials = {
  password: string;
  passwordConfirm: string;
  emailConfirmed: boolean;
  emailConfirmationToken:string
  emailConfirmationExpires:Date | null,
  passwordResetToken: string;
  passwordResetExpires: Date;
  passwordChangedAt: Date;
};

export type CredentialsLoginDataBody = {
  password:string,
  emailOrPhoneNumber:string
}