type FileSizeUnit = "KB" | "MB" | "GB" | "TB" | "PB" | "EB";
type ImageExtension = ".jpg" | ".jpeg" | ".png" | ".gif" | ".webp" | ".svg";

type ReadableFileExtension =
  | ".txt" // Plain text
  | ".md" // Markdown
  | ".pdf" // Portable Document Format
  | ".doc" // Word Document (older)
  | ".docx" // Word Document (modern)
  | ".ppt" // PowerPoint Format (older)
  | ".pptx" // PowerPoint Format (modern)
  | ".csv" // Comma-separated values
  | ".epub"; // eBook format

type CompressedFiles = ".zip" | ".rar";

export type DigitalProduct = {
  type: "digital";
  isPreviewable: boolean
  isDownloadable: boolean;
  isStreamable: boolean;
  accessControl?: {
    expiresAfter?: number; // days after purchase
    maxDownloads?: number;
  };
  fileSize: `${number}${FileSizeUnit}`;
  fileName: `${string}${ImageExtension | ReadableFileExtension | CompressedFiles}`;
  filePath:string // helps in Generating signed download links, Serving the file. 
};

export type PhysicalProduct = {
  type: "physical";
  weight: number;
};
