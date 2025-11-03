import cloudflareUpload from "@externals/cloudflare/cloudflareUploadFile";
import { ParsedFile, UploadFileData } from "@Types/helperTypes/Files";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";

async function uploadResourceFile(fileDirectory: UploadFileData["fileDirectory"], resourceId: MongoId, parsedFile: Array<ParsedFile>) {
  const uploadedFilesPaths: Array<Record<string, string>> = [];

  for (const fileInfo of parsedFile) {
    console.log("parsedFile.length", parsedFile.length);
    const result = await cloudflareUpload({ fileDirectory, resourceId:resourceId.toString(), fileInfo });
    if (!result.ok) return result;

    const fieldName = fileInfo.streamName; // exp: avatar
    const { result: fileUrl } = result; // exp: cdn.domain/filePath

    uploadedFilesPaths.push({ [fieldName]: fileUrl });
  }

  return new Success(uploadedFilesPaths);
}

export default uploadResourceFile;
