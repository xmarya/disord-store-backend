import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export type AssistantRegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  storeId: string;
  permissions: AssistantPermissions;
};

export interface StoreAssistant {
  id: string;
  assistant: MongoId;
  inStore: MongoId;
  permissions: AssistantPermissions;
}

export interface AssistantPermissions {
  updateStoreStatus:boolean
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
  replyToCustomers:boolean,
  manageOrders:boolean
}

export type StoreAssistantDocument = StoreAssistant & mongoose.Document;
