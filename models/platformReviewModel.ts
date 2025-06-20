import mongoose from "mongoose";
import { PlatformReviewDocument } from "../_Types/Review";

type PlatFormReviewModel = mongoose.Model<PlatformReviewDocument>;
const platformReviewSchema = new mongoose.Schema<PlatformReviewDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the user filed is required"],
    },
    reviewBody: {
      type: String,
      required: [true, "the reviewBody filed is required"],
    },
    displayInHomePage: {
      type:Boolean,
      default: false
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

const PlatformReview = mongoose.model<PlatformReviewDocument,PlatFormReviewModel>("PlatformReview", platformReviewSchema);
export default PlatformReview;