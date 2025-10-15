import { Success } from "@Types/ResultTypes/Success";
import extractDataFromFileUrl from "../../../_utils/files/extractDataFromFileUrl";
import cloudflareDeleteFile from "@externals/cloudflare/cloudflareDeleteFile";

async function deleteResourceFile(fileUrl: string) {
  const { filePath } = extractDataFromFileUrl(fileUrl);

  const r2Result = await cloudflareDeleteFile(filePath);
  if (!r2Result.ok) return r2Result;

  return new Success("updated resource object");
}

export default deleteResourceFile;
