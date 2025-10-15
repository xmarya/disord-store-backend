import { UploadFileData } from "@Types/helperTypes/Files";

const generateStoragePath = (fileDirectory: UploadFileData["fileDirectory"], resourceId: string, streamName: string, extension: string) => `${fileDirectory}/${resourceId}/${streamName}${extension}`;

export default generateStoragePath;
