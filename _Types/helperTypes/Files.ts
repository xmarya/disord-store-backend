export type ParsedFile = {
  [k:string]: {
    fileType: "image" | "pdf";
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  };
};

interface Image {
  fileType: "image";
  fileSize: number;
  identifier: string; // userId, storeId ..etc
}

interface PDF {
  fileType: "pdf";
  fileSize: number;
  identifier: string; // userId, storeId ..etc
}