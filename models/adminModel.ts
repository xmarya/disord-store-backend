import mongoose from "mongoose";
import { AdminDocument } from "../_Types/admin/AdminUser";
import { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { HASHING_SALT } from "../_data/constants";

type AdminModel = mongoose.Model<AdminDocument>;
const adminSchema = new Schema<AdminDocument>(
  {
    firstName: {
      type: String,
      required: [true, "the firstName field is required"],
    },
    lastName: {
      type: String,
      required: [true, "the lastName field is required"],
    },
    email: {
      type: String,
      required: [true, "the email field is required"],
    },
    phoneNumber: {
      type: String,
      // the format must be +9665xxxxxxxx
      minlength: [13, "the phone number should be 11 to 12 digits"],
      maxlength: [13, "the phone number should be 11 to 12 digits"],
      default: undefined,
      validate: {
        validator: function(value:string) {
          return value.startsWith("+966");
        },
        message: props => `${props.value} isn't a valid phone number. it must starts with +966`
      }
    },
    credentials: {
      emailConfirmed: {
        type: Boolean,
        default: false,
      },
      emailConfirmationToken: String,
      emailConfirmationExpires:Date,
      password: String,
      passwordResetToken: String,
      passwordResetExpires: Date,
      passwordChangedAt: Date,
    },
    userType: {
      type: String,
      default: "admin",
    },
    image: String,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// pre(save) for encrypting the password:
adminSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.credentials.password = await bcrypt.hash(this.credentials.password, HASHING_SALT);
  next();
});

const Admin = mongoose.model<AdminDocument, AdminModel>("Admin", adminSchema);

export default Admin;
