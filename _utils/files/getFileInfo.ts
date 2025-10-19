import { fileInfo } from "@Types/helperTypes/FileInfo";
import { MIME } from "@Types/helperTypes/Files";

function getFileInfo(fileBuffer: Buffer, mimeType: MIME.Any) {
  return { mimeType, fileSizeInBytes: fileInfo.getSizeInBytes(fileBuffer), 
    buffer: fileBuffer, fileExtension: fileInfo.getExtension(mimeType) };
}

export default getFileInfo;