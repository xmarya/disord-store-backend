import mongoose from "mongoose";
import { PlatformReviewDocument } from "@Types/Review";

type PlatFormReviewModel = mongoose.Model<PlatformReviewDocument>;
const platformReviewSchema = new mongoose.Schema<PlatformReviewDocument>(
  {
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the user filed is required"],
      unique: true,
    },
    reviewBody: {
      type: String,
      required: [true, "the reviewBody filed is required"],
    },
    userType: {
      type: String,
      enum: ["user", "storeOwner", "storeAssistant"],
      required: [true, "the userType field is required"],
    },
    firstName: {
      type: String,
      required: [true, "the firstName field is required"],
    },
    lastName: {
      type: String,
      required: [true, "the lastName field is required"],
    },
    image: String,
    displayInHomePage: {
      type: Boolean,
      default: false,
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

const PlatformReview = mongoose.model<PlatformReviewDocument, PlatFormReviewModel>("PlatformReview", platformReviewSchema);
export default PlatformReview;
