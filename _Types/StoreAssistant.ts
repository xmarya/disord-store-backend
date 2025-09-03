import mongoose from "mongoose";
import { MongoId } from "./MongoId";
import { UserTypes } from "./User";

export type AssistantDataBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: AssistantPermissions;
  phoneNumber?: `+966${string}`;
  image?:string
};

export type AssistantRegisterData = Omit<AssistantDataBody, "password"> & { userType: Extract<UserTypes, "storeAssistant">; storeId: MongoId; credentials: { password: string } };

export interface StoreAssistant {
  id: string;
  assistant: MongoId;
  inStore: MongoId;
  permissions: AssistantPermissions;
}

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

export type StoreAssistantDocument = StoreAssistant & mongoose.Document;
