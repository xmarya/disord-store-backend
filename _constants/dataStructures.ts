// for dates
export const SUPPORTED_DATE_FORMATS = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MMMM d, yyyy", "d MMMM, yyyy", "yyyy/MM/dd"];

export const planTiers = {
    "basic":1,
    "plus":2,
    "unlimited":3
};

export const TokenSlicer = {
    from:0,
    to:12
}


export const ACCEPTED_FILES_TYPES = ["application/pdf"];
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];


export const FILES_SIGNATURES = {
  jpg: "FFD8",
  jpeg: "FFD8",
  png: "89504E470D0A1A0A",
  webp: "52494646",
//   svg: "",
  pdf: "25504446",
}; // in hex

