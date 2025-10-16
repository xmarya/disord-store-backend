import { DeleteObjectsCommand, DeleteObjectsCommandInput, ObjectIdentifier } from "@aws-sdk/client-s3";
import s3 from "@config/S3Client";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import getCloudflareConfig from "./getCloudflareConfig";


async function cloudflareDeleteMultipleFiles(filesPath:ObjectIdentifier[]) {
    const {bucketName} = getCloudflareConfig();
    const params:DeleteObjectsCommandInput = {
        Bucket: bucketName,
        Delete: {
            Objects:filesPath,
            Quiet:true
        }
    }
    const command = new DeleteObjectsCommand(params);

    const commandResult = safeThrowable(
        () => s3.send(command),
        (error) => new Failure((error as Error).message)
    );

    return await extractSafeThrowableResult(() => commandResult);
}

export default cloudflareDeleteMultipleFiles;