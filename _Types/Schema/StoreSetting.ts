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
  storeId: MongoId;
  domain: StoreDomain;
  seo?: StoreSEO;
  colourTheme?: MongoId; // reference to one of the themes that defined inside ColourTheme Model, the user is going to select one theme
  storePages?: Array<StorePages>;
  socialMedia?: StoreSocialMedia;
  address?: StoreAddress;
  shipmentCompanies?: StoreShipmentMethods[];
  paymentMethods?: StorePaymentMethods;
}

export type StoreSettingDocument = StoreSettingDataBody & mongoose.Document
