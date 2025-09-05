export type FileSizeUnit = "KB" | "MB" | "GB" | "TB" | "PB" | "EB";
export type ImageExtension = ".jpg" | ".jpeg" | ".png" | ".gif" | ".webp" | ".svg";

export type ReadableFileExtension =
  | ".txt" // Plain text
  | ".md" // Markdown
  | ".pdf" // Portable Document Format
  | ".doc" // Word Document (older)
  | ".docx" // Word Document (modern)
  | ".ppt" // PowerPoint Format (older)
  | ".pptx" // PowerPoint Format (modern)
  | ".csv" // Comma-separated values
  | ".epub"; // eBook format

export type CompressedFiles = ".zip" | ".rar";
