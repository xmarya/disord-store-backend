import { MAX_SIZE } from "@constants/dataStructures";
import { MIME, ParsedFile } from "@Types/helperTypes/Files";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { ContentTooLarge } from "@Types/ResultTypes/errors/ContentTooLarge";
import { UnprocessableContent } from "@Types/ResultTypes/errors/UnprocessableContent";
import { Success } from "@Types/ResultTypes/Success";
import { FileInfo } from "busboy";
import checkFileMIME from "./checkFileMIME";
import checkFileSignature from "./checkFileSignature";
import checkFileSize from "./checkFileSize";
import cleanSVGContent from "./checkSVGContent";
import getFileInfo from "./getFileInfo";

function filesValidator(streamName: string, streamInfo: FileInfo, fileFullBuffer: Buffer) {
  const { mimeType } = streamInfo as { filename: string; mimeType: MIME.Any; encoding: string };

  const fileType = mimeType.includes("image") ? "image" : "document";

  const isAcceptedMIME = checkFileMIME(mimeType);
  if (!isAcceptedMIME) return new BadRequest(`the type of ${fileType}: ${streamName} isn't valid.`);

  const isAcceptedSize = checkFileSize(fileType, fileFullBuffer);
  if (!isAcceptedSize) return new ContentTooLarge(`uploaded ${fileType}: ${streamName} size mustn't exceed ${MAX_SIZE[fileType].megabytes}MB.`);
  
  const content = mimeType === "image/svg+xml" ? cleanSVGContent(fileFullBuffer) : checkFileSignature(mimeType, fileFullBuffer);
  if (!Buffer.isBuffer(content)) return new UnprocessableContent(`uploaded ${fileType}: ${streamName} seems to be corrupted.`);
  
  const fileInfo = getFileInfo(fileFullBuffer, mimeType);
  return new Success<ParsedFile>({ [streamName]: {fileType, ...fileInfo} });
}

export default filesValidator;
