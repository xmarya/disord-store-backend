import { ListObjectsV2Command, ListObjectsV2CommandInput } from "@aws-sdk/client-s3";
import s3 from "@config/S3Client";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import getCloudflareConfig from "./getCloudflareConfig";

async function getFilesList(filePath: string) {
  const { bucketName } = getCloudflareConfig();
  const params: ListObjectsV2CommandInput = {
    Bucket: bucketName,
    Prefix: filePath.startsWith("/") ? filePath.slice(1) : filePath,
  };

  const command = new ListObjectsV2Command(params);
  const commandResult = safeThrowable(
    () => s3.send(command),
    (error) => new Failure((error as Error).message)
  );

  const result = await extractSafeThrowableResult(() => commandResult);

  if (!result.ok) return result;

  const { Contents } = result.result;

  return new Success(Contents);
}

export default getFilesList;
