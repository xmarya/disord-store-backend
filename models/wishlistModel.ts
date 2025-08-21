import mongoose, { Model, Schema } from "mongoose";
import { WishlistDocument } from "@Types/Wishlist";

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

wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// this pre(find) hook is for populating specific field from the product model
wishlistSchema.pre("find", function (next) {
  /*REQUIRES TESTING*/ this.populate({ path: "product", select: "name store price image productType stock numberOfPurchases ranking ratingsAverage ratingsQuantity" });
  next();
});

const Wishlist = mongoose.model<WishlistDocument, WishListModel>("Wishlist", wishlistSchema);

export default Wishlist;
