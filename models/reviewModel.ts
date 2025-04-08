import lruCache  from "../_config/lruCache";
import { ReviewDocument } from "../_Types/Reviews";
import mongoose, { Document } from "mongoose";

type ReviewModel = mongoose.Model<ReviewDocument>;

export const reviewSchema = new mongoose.Schema<ReviewDocument>(
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
    wroteAt: {
      type: Date,
      required: [true, "the wroteAt filed is required"],
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
