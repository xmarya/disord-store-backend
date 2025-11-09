import mongoose from "mongoose";
import { MongoId } from "./MongoId";

type StoreAddress = { street: string; city: string; postalCode?: string; country: string; phone?: string };
type StoreSocialMedia = {
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: Array<string>;
  email?: string;
};
type StoreSEO = {
  title: string;
  description: string;
  keywords: string;
  sitemap?: string;
};
type StoreDomain = {
  name: string;
};
type StorePages = {
  title: string;
  markdown: string;
};
type StorePaymentMethods = {
  name:string
};
type StoreShipmentMethods = {
  name: string;
  accountNumber: string;
};

export type StoreSettingDataBody = {
  domain: StoreDomain;
  seo?: StoreSEO;
  colourTheme?: MongoId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  socialMedia?: StoreSocialMedia;
  storePages?: Array<{ pageTitle: string; htmlContent: string }>;
  address?: StoreAddress;
  shipmentCompanies?: StoreShipmentMethods[];
  paymentMethods?: StorePaymentMethods;
};

export type StoreSettingDocument = Omit<StoreSettingDataBody, "storePages"> & {
  storeId: MongoId;
  storePages?: Array<StorePages>;
} & mongoose.Document;
