import { CopyObjectCommand, CopyObjectCommandInput } from "@aws-sdk/client-s3";
import getCloudflareConfig from "./getCloudflareConfig";
import safeThrowable from "@utils/safeThrowable";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import s3 from "@config/S3Client";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";

async function cloudflareCopyFile({ oldPath, newPath }: { oldPath: string; newPath: string }) {
  const { bucketName } = getCloudflareConfig();
  const params: CopyObjectCommandInput = {
    Bucket: bucketName,
    CopySource: `/${bucketName}/${oldPath}`,
    Key: newPath,
  };
  const command = new CopyObjectCommand(params);

  const result = safeThrowable(
    () => s3.send(command),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => result);
}

export default cloudflareCopyFile;
