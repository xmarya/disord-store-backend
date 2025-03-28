import { Model, Schema, model, models } from "mongoose";
import { WishlistDocument } from "../_Types/Wishlist";

// a feature only accessible by the Plus subscribers
type WishListModel = Model<WishlistDocument>;
const wishlistSchema = new Schema<WishlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "the user filed is required"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "the user filed is required"],
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

const Wishlist =
  models?.Wishlist ||
  model<WishlistDocument, WishListModel>("Wishlist", wishlistSchema);

export default Wishlist;
