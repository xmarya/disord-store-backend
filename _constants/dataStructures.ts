import { AcceptedDocumentsMIME, AcceptedImagesMIME } from "@Types/helperTypes/Files";

// for dates
export const SUPPORTED_DATE_FORMATS = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MMMM d, yyyy", "d MMMM, yyyy", "yyyy/MM/dd"];

export const planTiers = {
  basic: 1,
  plus: 2,
  unlimited: 3,
};

export const TokenSlicer = {
  from: 0,
  to: 12,
};

export const ACCEPTED_FILES_MIME:Array<AcceptedDocumentsMIME> = ["application/pdf"];
export const ACCEPTED_IMAGE_MIME: Array<Exclude<AcceptedImagesMIME, "application/pdf">> = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

export const FILES_SIGNATURES_IN_HEX = {
  jpg: "FFD8",
  jpeg: "FFD8",
  png: "89504E470D0A1A0A",
  webp: "52494646",
  pdf: "25504446",
}; 
