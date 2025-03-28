import { Types } from "mongoose";

export interface StoreAssistant {
  _id: string;
  assistant: Types.ObjectId;
  inStore: Types.ObjectId;
  permissions: AssistantPermissions;
}

export interface AssistantPermissions {
  changePrice: boolean;
  addProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  addCategory: boolean;
  editCategory: boolean;
  deleteCategory: boolean;
  addDiscount: boolean;
  editDiscount: boolean;
  changeStoreSettings: boolean;
  previewStoreStats: boolean;
}

export type StoreAssistantDocument = StoreAssistant;
