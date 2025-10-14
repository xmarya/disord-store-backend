import uploadResourceFile from "@services/_sharedServices/fileServices/uploadResourceFile";
import { FileDirectory, ParsedFile } from "@Types/helperTypes/Files";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import extractObjectsFromArray from "@utils/extractObjectsFromArray";

async function uploadFilesAndMergeIntoBodyData<T>(resourceDirectory: FileDirectory, resourceId: MongoId, parsedFile: Array<ParsedFile>, bodyData: T) {
  if(!parsedFile.length) return new Success(bodyData);

  const uploadResult = await uploadResourceFile(resourceDirectory, resourceId.toString(), parsedFile);
  if (!uploadResult.ok) return uploadResult;

  const { result: uploadedFilesPaths } = uploadResult;
  return new Success({ ...bodyData, ...extractObjectsFromArray(uploadedFilesPaths) });
}

export default uploadFilesAndMergeIntoBodyData