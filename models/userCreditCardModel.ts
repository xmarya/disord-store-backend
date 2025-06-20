import mongoose from "mongoose";
import { CreditCardDocument } from "../_Types/UserCreditCard";

type CreditCardModel = mongoose.Model<CreditCardDocument>;
export const creditCardSchema = new mongoose.Schema<CreditCardDocument>(
  {
    cardName: { type: String, required: [true, "the cardName field is required"] },
    cardNumber: {
      type: String,
      unique: true,
      required: [true, "the cardNumber field is required"],
      minlength: [16, "the card number must be 16 digits"],
      maxlength: [16, "the card number must be 16 digits"],
    },
    cardExpireIn: { type: String, required: [true, "the cardExpireIn field is required"] },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

creditCardSchema.index({ cardNumber: 1, cardName: 1 }, { unique: true });
// this pre(save) hook for encrypting all the creditCard info
creditCardSchema.pre("save", async function (next) {
  next();
});

const UserCreditCard = mongoose.model<CreditCardDocument, CreditCardModel>("UserCreditCard", creditCardSchema);

export default UserCreditCard;
