import { MIME } from "@Types/helperTypes/Files";
import { format } from "date-fns";

class FileInfo {
  constructor() {}

  getUploadDate() {
    return format(new Date(), "yyMMdd-HHmmssSSS");
  }
  getSizeInBytes(fileBuffer: Buffer) {
    return fileBuffer.byteLength;
  }
  getExtension(mimeType: MIME.Any) {
    return mimeType === "image/svg+xml" ? ".svg" : ".".concat(mimeType.split("/")[1]);
  }
}

export const fileInfo = new FileInfo();