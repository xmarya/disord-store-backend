import mongoose, { Schema } from "mongoose";
import { AddressDocument } from "@Types/Schema/Users/UserAddress";

type AddressModel = mongoose.Model<AddressDocument>;

export const addressSchema = new Schema<AddressDocument>(
  {
    country: {
      type: String,
      required: [true, "the country field is required"],
    },
    province: {
      type: String,
      required: [true, "the province field is required"],
    },
    city: {
      type: String,
      required: [true, "the city field is required"],
    },
    district: {
      type: String,
      required: [true, "the district field is required"],
    },
    street: {
      type: String,
      required: [true, "the street field is required"],
    },
    nearestLandmark: {
      type: String,
      required: [true, "the nearestLandmark field is required"],
    },
    addressType: {
      type: String,
      required: [true, "the addressType field is required"],
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const UserAddress = mongoose.model<AddressDocument, AddressModel>("UserAddress", addressSchema);

export default UserAddress;
