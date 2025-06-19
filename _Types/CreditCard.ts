import mongoose from "mongoose";

export type CreditCardDataBody = {
  cardName: string;
  cardNumber: string;
  cardExpireIn: string;
  CVV:string,
};

export type CreditCardDocument = Omit<CreditCardDataBody, "CVV"> & mongoose.Document;