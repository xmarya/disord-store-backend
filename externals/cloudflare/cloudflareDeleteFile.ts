import { DeleteObjectCommand, DeleteObjectCommandInput } from "@aws-sdk/client-s3";
import s3 from "@config/S3Client";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import getCloudflareConfig from "./getCloudflareConfig";

export async function cloudflareDeleteFile(filePath: string) {
  const { bucketName } = getCloudflareConfig();

  const params: DeleteObjectCommandInput = {
    Bucket: bucketName,
    Key: filePath,
  };
  const command = new DeleteObjectCommand(params);

  const commandResult = safeThrowable(
    () => s3.send(command),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => commandResult);
}

// make this a consumer
// async function cloudflareDeleteMany(filesUrl: Array<string>) {}

export default cloudflareDeleteFile;