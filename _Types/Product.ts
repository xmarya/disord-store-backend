import { CategoryDocument } from "./Category";
import { MongoId } from "./MongoId";
import { CompressedFiles, FileSizeUnit, ImageExtension, ReadableFileExtension } from "./DigitalProductExtensions";
import mongoose from "mongoose";


export interface ProductDataBody {
  productType: "digital" | "physical";
  name: string;
  price: number;
  image: Array<string>;
  description: string;
  stock: number | null;
  categories: Array<CategoryDocument>;
  store: MongoId;
}

interface ProductBasic {
  ranking: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  discount: number;
  numberOfPurchases: number;
}

export interface DigitalProduct extends ProductDataBody, ProductBasic {
  productType: "digital";
  isPreviewable: boolean;
  isDownloadable: boolean;
  isStreamable: boolean;
  accessControl?: {
    expiresAfter?: number; // days after purchase
    maxDownloads?: number;
  };
  fileSize: `${number}${FileSizeUnit}`;
  fileName: `${string}${ImageExtension | ReadableFileExtension | CompressedFiles}`;
  filePath: string; // helps in Generating signed download links, Serving the file.
}

export interface PhysicalProduct extends ProductDataBody, ProductBasic {
  productType: "physical";
 weight:number;
}

export type ProductDocument = (DigitalProduct | PhysicalProduct) & mongoose.Document;
