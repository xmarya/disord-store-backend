import { AdminDocument } from "@Types/Schema/Users/admin/AdminUser";
import mongoose, { Schema } from "mongoose";

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
      minlength: [13, "the phone number should start with +966"],
      maxlength: [13, "the phone number should start with +966"],
      default: undefined,
      validate: {
        validator: function (value: string) {
          return value.startsWith("+966");
        },
        message: (props) => `${props.value} isn't a valid phone number. it must starts with +966`,
      },
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


const Admin = mongoose.model<AdminDocument, AdminModel>("Admin", adminSchema);

export default Admin;
