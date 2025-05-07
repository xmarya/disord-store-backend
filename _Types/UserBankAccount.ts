import mongoose from "mongoose";

export type BankAccount = {
  cardName: string;
  cardNumber: string;
  cardExpireIn: {
    month: string;
    year: string;
  };
};

export type BankAccountDocument = BankAccount & mongoose.Document