import { ObjectIdentifier } from "@aws-sdk/client-s3";
import { renameStoragePath } from "@utils/files/renameStoragePath";
import cloudflareCopyFile from "./cloudflareCopyFile";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";



async function cloudflareRenameFile(toBeRenamedFiles:Array<string>, resourceId:string ) {

  let toBeUpdatedFields: Record<string, string> = {};
  let toBeDeletedUrls: Array<ObjectIdentifier> = [];

  for (const fileUrl of toBeRenamedFiles) {
    // loop from here
    const { oldPath, newPath } = renameStoragePath({ oldFileUrl: fileUrl, resourceId });

    const copyResult = await cloudflareCopyFile({ oldPath, newPath });
    if (!copyResult.ok) return copyResult;

    // merge the domain + new path
    const newFileUrl = fileUrl.replace(oldPath, newPath);

    // shape the data for the db
    const fileIndex = 2;
    const fileNameIndex = 0;
    const updatedField = newPath.split("/")[fileIndex].split(".")[fileNameIndex];
    toBeUpdatedFields = { ...toBeUpdatedFields, ...{ [updatedField]: newFileUrl } };
    toBeDeletedUrls.push({Key:oldPath});
  }

  return new Success({toBeUpdatedFields, toBeDeletedUrls})
}

export default cloudflareRenameFile;