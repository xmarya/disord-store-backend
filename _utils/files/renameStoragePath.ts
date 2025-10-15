import { MongoId } from "@Types/Schema/MongoId";
import extractDataFromFileUrl from "@utils/files/extractDataFromFileUrl";
import generateStoragePath from "./generateStoragePath";

export const renameStoragePath = ({ resourceId, oldFileUrl }: { resourceId: MongoId; oldFileUrl: string }) => {
  const { filePath: oldPath, fileDirectory, file } = extractDataFromFileUrl(oldFileUrl);
  
  const [fileName, extension] = file.split(".");
  const newPath = generateStoragePath(fileDirectory, resourceId.toString(), fileName, `.${extension}`);

  return { oldPath, newPath };
};
