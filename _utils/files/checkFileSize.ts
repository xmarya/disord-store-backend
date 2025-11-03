import { MAX_SIZE } from "@constants/dataStructures";

function checkFileSize(fileType: "image" | "document", fileBuffer: Buffer) {
  const fileMaxSize = MAX_SIZE[fileType].bytes;
  const fileSizeInBytes = fileBuffer.byteLength;
  return fileSizeInBytes < fileMaxSize;
}

export default checkFileSize;
