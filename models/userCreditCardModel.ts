import mongoose, { Schema } from "mongoose";
import { UserCreditCardDocument } from "@Types/UserCreditCard";
import bcrypt from "bcryptjs";
import { AppError } from "@utils/AppError";

type UserCreditCardModel = mongoose.Model<UserCreditCardDocument>;
export const creditCardSchema = new Schema<UserCreditCardDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "the usr field is required"],
    },
    cardName: { type: String, required: [true, "the cardName field is required"] },
    cardNumber: {
      type: String,
      unique: true,
      required: [true, "the cardNumber field is required"],
      minlength: [16, "the card number must be 16 digits"],
      maxlength: [16, "the card number must be 16 digits"],
    },
    cardExpireIn: { type: String, required: [true, "the cardExpireIn field is required"] },
    isDefault: {
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

creditCardSchema.index({ cardNumber: 1, cardName: 1 }, { unique: true });

// this pre(save) hook for checking on isDefault + updating the related user doc
creditCardSchema.pre("save", async function (next) {
  if (!this.isModified("isDefault")) return next();

  next();
});

/* OLD CODE (kept for reference): 
// this pre(save) hook for encrypting all the creditCard info
creditCardSchema.pre("save", async function (next) {
  let encryptedDigits = this.cardNumber.slice(0, 12); // it doesn't include the last digit, so, it actually ends where I want it to end, which is index 11.
  encryptedDigits = await bcrypt.hash(encryptedDigits, HASHING_SALT);
  
  const finalResult = encryptedDigits + this.cardNumber.slice(12);
  this.cardNumber = finalResult;
  next();
});

// this pre(findById) hook is for decrypting the card number when it's being retrieved
creditCardSchema.pre("findOne", async function (next) {
  const doc = await this.model.findById(this.getFilter()) as UserCreditCardDocument;
  if(!doc) return next(new AppError(400, "couldn't find the user's credit card"));
  
  const {cardNumber} = doc;
  // poiuytffghjkl;1707
  
  const lastFourDigits = cardNumber.slice(cardNumber.length - 4, cardNumber.length);
  const encryptedDigits = cardNumber.slice(0, cardNumber.length - 4);
  
  
  next();
});
*/

const UserCreditCard = mongoose.model<UserCreditCardDocument, UserCreditCardModel>("UserCreditCard", creditCardSchema);

export default UserCreditCard;
