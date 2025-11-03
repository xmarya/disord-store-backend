import getCloudflareConfig from "@externals/cloudflare/getCloudflareConfig";
import { UploadFileData } from "@Types/helperTypes/Files";

const extractDataFromFileUrl = (fileUrl: string) => {
  const { publicDomain } = getCloudflareConfig();

  const filePath = fileUrl.replace(publicDomain as string, "");
  const [fileDirectory, resourceId, file] = filePath.split("/"); // "users/123456789/avatar.jpeg"

  return { filePath, fileDirectory, resourceId, file } as {filePath:string, fileDirectory:UploadFileData["fileDirectory"], resourceId:string, file:string};
};

export default extractDataFromFileUrl;
