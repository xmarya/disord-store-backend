export type AcceptedImagesMIME = "image/png" | "image/jpeg" | "image/jpg" | "image/webp" | "image/svg+xml";
export type AcceptedDocumentsMIME = "application/pdf";

export namespace MIME {
  export type Image = AcceptedImagesMIME;
  export type Document = AcceptedDocumentsMIME;
  export type Any = Image | Document;
}

export type FileTypes<T extends MIME.Any> = T extends MIME.Document ? "document" : "image";

export type ParsedFile = Record<string, Image | SVG | PDF>;

interface BaseFile<T extends MIME.Any> {
  fileName: string;
  fileType: FileTypes<T>;
  fileExtension: string;
  fileSizeInBytes: number;
  buffer: Buffer;
  mimeType: T;
  // svgContent?: string
}

// export type FormattedFile<T extends MIME.Any> = {
//   fileType: FileTypes<T>;
//   fileName: string;
//   fileSize: number;
//   svgContent?: string;
// };

interface Image extends BaseFile<Exclude<MIME.Image, "image/svg+xml">> {}
interface SVG extends BaseFile<Extract<MIME.Image, "image/svg+xml">> {
  svgContent: string;
}
interface PDF extends BaseFile<MIME.Document> {}
