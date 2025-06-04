import mongoose from "mongoose";
import { BankAccountDocument } from "../_Types/UserBankAccount";

type BankAccountModel = mongoose.Model<BankAccountDocument>;
export const bankAccountSchema = new mongoose.Schema<BankAccountDocument>(
  {
    cardName: {type:String, required: [true, "the cardName field is required"]},
    cardNumber: {type:String, required: [true, "the cardNumber field is required"]},
    cardExpireIn: {
      month: {type:String, required: [true, "the month field is required"]},
      year: {type:String, required: [true, "the year field is required"]},
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
// TODO: encrypt all the bankAccount info

const UserBankAccount = mongoose.model<BankAccountDocument, BankAccountModel>("UserBankAccount", bankAccountSchema);

export default UserBankAccount;
