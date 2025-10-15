import { MongoId } from "@Types/Schema/MongoId";
import extractDataFromFileUrl from "@utils/files/extractDataFromFileUrl";
import generateStoragePath from "./generateStoragePath";

export const renameStoragePath = ({resourceId, fileUrl}:{resourceId:MongoId,fileUrl: string}) => {
  const {fileDirectory, file} = extractDataFromFileUrl(fileUrl);
  const [fileName, extension] = file.split(".");
  return generateStoragePath(fileDirectory, resourceId.toString(), fileName, extension);
};
