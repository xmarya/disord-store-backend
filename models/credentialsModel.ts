import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

type CredentialsModel = mongoose.Model<CredentialsDocument>;
const credentialsSchema = new Schema<CredentialsDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "the email field is required"],
    },
    password: {
      type: String,
      minLength: [8, "your password must be at least 8 characters"],
      select: false,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailConfirmationToken: { type: String, select: false },
    emailConfirmationExpires: { type: Date, select: false, default: null },
    // passwordConfirm: String, // NOTE: zod will be use to validate this filed
    // on the front-end + the field itself won't be saved in the db.
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    phoneNumber: {
      type: String,
      // the format must be +9665xxxxxxxx
      minlength: [13, "the phone number should start with +966"],
      maxlength: [13, "the phone number should start with +966"],
      default: undefined,
      validate: {
        validator: function (value: string) {
          return value.startsWith("+966");
        },
        message: (props) => `${props.value} isn't a valid phone number. it must starts with +966`,
      },
      unique: true,
      sparse: true, // in order to not recognise null/undefined as a unique value, and to be only unique for existing phoneNumber
    },
    userType: {
      type: String,
      enum: ["admin", "storeOwner", "storeAssistant", "user"] /* SOLILOQUY: what if the user can be both an owner and an assistant? in this case the type should be [String] */,
      required: [true, "the userType field is required"],
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// this pre hook is for encrypting the pass before saving it for NEW USERS:
credentialsSchema.pre("save", async function (next) {
  if (this.isNew && this.password) {
    this.password = await bcrypt.hash(this.password, Number(process.env.HASHING_SALT_ROUNDS));
  }
  next();
});

// this pre hook for forget/rest or change password, it encrypts the password and sets the changeAt
credentialsSchema.pre("save", async function (next) {
  if (!this.isNew && this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, Number(process.env.HASHING_SALT_ROUNDS));
    this.passwordChangedAt = new Date();
  }

  next();
});

const Credentials = mongoose.model<CredentialsDocument, CredentialsModel>("Credentials", credentialsSchema);

export default Credentials;
