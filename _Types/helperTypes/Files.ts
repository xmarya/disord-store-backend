export type AcceptedImagesMIME = "image/png" | "image/jpeg" | "image/jpg" | "image/webp" ;
export type AcceptedSVGMIME = "image/svg+xml" ;
export type AcceptedDocumentsMIME = "application/pdf";

export namespace MIME {
  export type Image = AcceptedImagesMIME;
  export type SVG = AcceptedSVGMIME;
  export type Document = AcceptedDocumentsMIME;
  export type Any = Image | SVG | Document;
}

interface BaseFile<T extends MIME.Any> {
  streamName:string,
  fileName: string;
  fileType: "document" | "image";
  fileExtension: string;
  fileSizeInBytes: number;
  buffer: Buffer;
  mimeType: T;
}
export interface Image extends BaseFile<MIME.Image> {
  fileType: "image";
}
export interface SVG extends BaseFile<MIME.SVG> {
  fileType: "image";
}
export interface PDF extends BaseFile<MIME.Document> {
  fileType: "document";
}

// export type ParsedFile = Record<string, BaseFile<MIME.Any>>;
export type ParsedFile = BaseFile<MIME.Any>;

