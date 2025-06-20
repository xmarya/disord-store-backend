import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export type UserCreditCardDataBody = {
  user:MongoId
  cardName: string;
  cardNumber: string;
  cardExpireIn: string;
  CVV:string,
  isDefault:boolean,
};

export type UserCreditCardDocument = Omit<UserCreditCardDataBody, "CVV"> & mongoose.Document;