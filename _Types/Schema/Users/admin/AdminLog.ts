import mongoose from "mongoose";
import { PlansNames } from "../../Plan";

type StoresLogs = {
  storeInfo: {
    storeName: string;
    storeOwnerFullName: string;
    storeOwnerEmail: string;
  };
  action: "storeDeletion" | "storeSuspending";
  actionBy: {
    userId: mongoose.Types.ObjectId;
  };
  notes: string;
  actionDate: Date;
};

type UsersLogs = {
  userId: mongoose.Types.ObjectId;
  action: "accountDeletion" | "assistantDeletion";
  actionBy: {
    userId: mongoose.Types.ObjectId;
  };
  notes: string;
  actionDate: Date;
};

type SubscriptionsLogs = {
  userId: mongoose.Types.ObjectId;
  planName: PlansNames;
  profit: number;
  action: "subscription" | "cancellation";
  notes: string;
  actionDate: Date;
};

export type AdminLog<T extends StoresLogs | UsersLogs | SubscriptionsLogs> = {
  logType: "stores" | "users" | "subscriptions";
  log: T;
};

export type AdminLogDocument<T extends StoresLogs | UsersLogs | SubscriptionsLogs> = AdminLog<T> & mongoose.Document;
