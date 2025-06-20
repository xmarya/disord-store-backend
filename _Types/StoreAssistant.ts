import mongoose, { Types } from "mongoose";

export type AssistantRegisterData = {
  email: string;
  password: string;
  username: string;
  storeId: string;
  permissions: AssistantPermissions;
};

export interface StoreAssistant {
  id: string;
  assistant: Types.ObjectId;
  inStore: Types.ObjectId;
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
  UpdateCoupon: boolean;
  replyToCustomers:boolean,
  manageOrders:boolean
}

export type StoreAssistantDocument = StoreAssistant & mongoose.Document;
