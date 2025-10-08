import { MAX_IMAGE_SIZE_BYTES, MAX_PDF_SIZE_BYTES } from "@constants/primitives";
import { MIME } from "@Types/helperTypes/Files";

function checkFileSize(mimeType: MIME.Any, fileBuffer: Buffer) {
  const fileMaxSize = mimeType.includes("pdf") ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const fileSizeInBytes = fileBuffer.byteLength;
  return fileSizeInBytes < fileMaxSize;
}

export default checkFileSize;
