import { CartDocument } from "../_Types/Cart";
import { Model, Schema, model } from "mongoose";

type CartModel = Model<CartDocument>;

const cartSchema = new Schema<CartDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensure one cart per user
    },
    productsList: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "product id is required for the cart"],
        },
        name: {
          type: String,
          required: [true, "product name is required for the cart"],
        },
        price: {
          type: Number,
          required: [true, "product price is required for the cart"],
        },
        productType: {
          type: String,
          enum: ["physical", "digital"],
          required: [true, "product type is required for the cart"],
        },
        image: {
          type: String,
          required: [true, "product price is required for the cart"],
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        discount: Number,
        weight: Number,
      },
    ],
    discountedPrice: Number,
    totalWeight: Number,
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.index({ user: 1 }, { unique: true });

cartSchema.virtual("total").get(function () {
  // NOTE: I decided to make the total a virtual files to prevent the staleness in case a product's price has changed
  // using this approach ig going to retrieve the VF total each time the users access their carts
  // IN ADDITION, this approach will save me time of manual recalculations ✨
  return this.productsList.reduce((sum, prod) => {
    if (!prod.discount) prod.discount = 0;
    const totalPrice = (prod.price - (prod.discount ?? 0)) * prod.quantity;
    return sum + totalPrice;
  }, 0);
});

const Cart = model<CartDocument, CartModel>("Cart", cartSchema);

export default Cart;
