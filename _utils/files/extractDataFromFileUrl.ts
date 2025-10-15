import getCloudflareConfig from "@externals/cloudflare/getCloudflareConfig";

const extractDataFromFileUrl = (fileUrl: string) => {
  const { publicDomain } = getCloudflareConfig();

  const filePath = fileUrl.replace(publicDomain as string, "");
  const [fileDirectory, resourceId, file] = filePath.split("/"); // "users/123456789/avatar.jpeg"

  return { filePath, fileDirectory, resourceId, file };
};

export default extractDataFromFileUrl;
