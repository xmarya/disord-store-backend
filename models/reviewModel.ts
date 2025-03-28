import { ReviewDocument } from "../_Types/Reviews";
import { Model, Schema, model, models } from "mongoose";

type ReviewModel = Model<ReviewDocument>;

const reviewSchema = new Schema<ReviewDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
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
    reviewedModel: {
      type: Schema.Types.ObjectId,
      /* SOLILOQUY: I think I have to remove the required condition in order to insert reviews that belongs to the platform itself,
            so, in this way I can insert a new doc without being associated to another id another schema.
            and for searching I just have to select only any review with Platform type
            // required: [true, "the reviewedModel filed is required"],
            */

      // Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
      // will look at the `docModel` property to find the right model.
      refPath: "reviewType",
    },
    reviewType: {
      type: String,
      required: [true, "the review must have a model"],
      enum: ["Product", "Store", "Platform"],
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

const Review =
  models?.Review || model<ReviewDocument, ReviewModel>("Review", reviewSchema);

export default Review;
