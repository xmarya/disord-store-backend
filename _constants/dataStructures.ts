import { AcceptedDocumentsMIME, AcceptedImagesMIME, AcceptedSVGMIME } from "@Types/helperTypes/Files";
import { MAX_DOCUMENT_SIZE_BYTES, MAX_DOCUMENT_SIZE_MB, MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "./primitives";

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
export const ACCEPTED_IMAGE_MIME: Array<AcceptedImagesMIME> = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const ACCEPTED_SVG_MIME: Array<AcceptedSVGMIME> = ["image/svg+xml"];

export const MAX_SIZE = {
  image: {
    bytes:MAX_IMAGE_SIZE_BYTES,
    megabytes:MAX_IMAGE_SIZE_MB
  },
  document: {
    bytes:MAX_DOCUMENT_SIZE_BYTES,
    megabytes:MAX_DOCUMENT_SIZE_MB
  }
}

export const FILES_SIGNATURES_IN_HEX = {
  jpg: "FFD8",
  jpeg: "FFD8",
  png: "89504E470D0A1A0A",
  webp: "52494646",
  pdf: "25504446",
}; 
