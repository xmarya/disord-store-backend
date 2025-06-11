import { ReviewDocument } from "../_Types/Review";
import mongoose, { Schema } from "mongoose";

type ReviewModel = mongoose.Model<ReviewDocument>;

export const reviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the user field is required"],
    },
    reviewedResourceId: {
      type: Schema.Types.ObjectId,
      refPath: "storeOrProduct",
      required: [true, "the reviewedModelId field is required"],
    },
    storeOrProduct: {
      type: String,
      enum: ["Store", "Product"],
      required: [true, "the review must have a model id for a Store or a Product"],
    },
    reviewBody: {
      type: String,
      minlength: [50, "minimum length is 50 characters"],
      maxlength: [500, "maximum length is 500 characters"],
      required: [true, "the reviewBody field is required"],
    },
    rating: {
      type: Number,
      required: [true, "you must rate with a number between 1 to 5"],
      min: 1,
      max: 5,
    },
    storeReply: {
      type: String,
      maxlength: [500, "maximum length is 500 characters"],
      default: null,
    },
    displayInStorePage: {
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

// ensure that the uniqueness of the roaster/bean-user combination,
// so there are no duplicated reviews from the same user on the same doc:
reviewSchema.index({ reviewedModel: 1 , user: 1}, { unique: true});
const Review = mongoose.model<ReviewDocument, ReviewModel>("Review", reviewSchema);

export default Review;
