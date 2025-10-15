const extractDataFromFileUrl = ({ publicDomain, fileUrl }: { publicDomain: string; fileUrl: string }) => {
  const filePath = fileUrl.replace(publicDomain as string, "");
  const [fileDirectory, resourceId, file] = filePath.split("/"); // "users/123456789/avatar.jpeg"

  return { filePath, fileDirectory, resourceId, file };
};

export default extractDataFromFileUrl;
