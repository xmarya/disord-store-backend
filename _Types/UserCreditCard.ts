import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export type CreditCardDataBody = {
  user:MongoId
  cardName: string;
  cardNumber: string;
  cardExpireIn: string;
  CVV:string,
};

export type CreditCardDocument = Omit<CreditCardDataBody, "CVV"> & mongoose.Document;