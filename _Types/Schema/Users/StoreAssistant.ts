import mongoose from "mongoose";
import { MongoId } from "../MongoId";
import { Credentials } from "./UserCredentials";
import { UserTypes } from "./BasicUserTypes";

export interface AssistantPermissions {
  updateStoreStatus: boolean;
  changePrice: boolean;
  addProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  addCategory: boolean;
  editCategory: boolean;
  deleteCategory: boolean;
  addDiscount: boolean;
  editDiscount: boolean;
  previewStoreStats: boolean;
  addCoupon: boolean;
  updateCoupon: boolean;
  replyToCustomers: boolean;
  manageOrders: boolean;
}

export type AssistantDataBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: AssistantPermissions;
  phoneNumber: `+966${string}`;
  image?: string;
};

export interface StoreAssistant extends Omit<AssistantDataBody, "password"> {
  inStore: MongoId;
  inPlan: MongoId;
  permissions: AssistantPermissions;
  userType: Extract<UserTypes, "storeAssistant">;
  credentials: Pick<Credentials, "password"> & Partial<Omit<Credentials, "password">>;
}

export type StoreAssistantDocument = StoreAssistant & mongoose.Document;
