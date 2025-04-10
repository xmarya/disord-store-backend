import { ReviewDocument } from "../_Types/Reviews";
import mongoose from "mongoose";

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
    rating: {
      type:Number,
      required: [true, "you must rate with a number between 1 to 5"],
      min:1,
      max:5
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