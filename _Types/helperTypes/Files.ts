export type AcceptedImagesMIME = "image/png" | "image/jpeg" | "image/jpg" | "image/webp" | "image/svg+xml";
export type AcceptedTextFilesMIME = "application/pdf";

export namespace MIME {
  export type Image = AcceptedImagesMIME;
  export type TextFile = AcceptedTextFilesMIME;
  export type Any = Image | TextFile;
}

export type FileTypes<T extends MIME.Any> = T extends MIME.TextFile ? "pdf" : "image" ;

export type ParsedFile = Record<string, Image | SVG | PDF>;

export interface BaseFile<T extends MIME.Any> {
  fileName: string;
  fileType: FileTypes<T>;
  fileSizeInBytes: number;
  buffer: Buffer;
  mimeType: T;
  // svgContent?: string
}

export type FormattedFile<T extends MIME.Any> = {
  fileType: FileTypes<T>;
  fileName: string;
  fileSize: number;
  svgContent?: string;
};

interface Image extends BaseFile<Exclude<MIME.Image, "image/svg+xml">> {}
interface SVG extends BaseFile<Extract<MIME.Image, "image/svg+xml">> { svgContent: string }
interface PDF extends BaseFile<MIME.TextFile> {}
