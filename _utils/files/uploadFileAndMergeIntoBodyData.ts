import uploadResourceFile from "@services/_sharedServices/fileServices/uploadResourceFile";
import { ParsedFile, UploadFileData } from "@Types/helperTypes/Files";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import extractObjectsFromArray from "@utils/extractObjectsFromArray";

async function uploadFileAndMergeIntoBodyData(resourceDirectory: UploadFileData["resourceDirectory"], resourceId: MongoId, parsedFile: Array<ParsedFile>, bodyData: Record<string, any>) {
  const uploadResult = await uploadResourceFile(resourceDirectory, resourceId.toString(), parsedFile);
  if (!uploadResult.ok) return uploadResult;

  const { result: uploadedFilesPaths } = uploadResult;
  return new Success({ ...bodyData, ...extractObjectsFromArray(uploadedFilesPaths) });
}

export default uploadFileAndMergeIntoBodyData