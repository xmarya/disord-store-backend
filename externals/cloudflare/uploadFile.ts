/*
    0- virus scan?
    1- check file type (image, PDF) ✅ 
    2- check th size ✅
    3- encrypt the file (S3 does it internally by setting a specific header)
    4- upload ✅
    5- get uploaded file KEY ✅
    6- store it in db
*/

import { Upload } from "@aws-sdk/lib-storage";
import s3 from "@config/S3Client";
import { FileDirectory, UploadFileData } from "@Types/helperTypes/Files";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import getCloudflareConfig from "./getCloudflareConfig";

const generateStoragePath = (fileDirectory: FileDirectory, resourceId: string, streamName: string, extension: string) => `${fileDirectory}/${resourceId}/${streamName}${extension}`;
/*

    examples:
    - users/123456789/avatar.jpeg

    - stores/987654321/logo.svg
    - stores/987654321/certificate.pdf

    - products/456718293/cover.jpeg
    - products/456718293/product-name-1.jpeg
    - products/456718293/product-name-2.jpeg
    - products/456718293/product-name-3.jpeg

  */

async function cloudflareUpload({ fileDirectory, resourceId, fileInfo }: UploadFileData) {
  const storagePath = generateStoragePath(fileDirectory, resourceId, fileInfo.streamName, fileInfo.fileExtension);
  const { bucketName, publicDomain } = getCloudflareConfig();
  try {
    const upload = new Upload({
      client: s3,
      leavePartsOnError: false,
      params: {
        Bucket: bucketName,
        Key: storagePath,
        Body: fileInfo.buffer,
        ContentType: fileInfo.mimeType,
        ContentLength: fileInfo.fileSizeInBytes,
        ACL: "private",
        ServerSideEncryption: "AES256",
      },
    });

    const { Key } = await upload.done();

    return new Success(`${publicDomain}${Key}`);
  } catch (error) {
    return new Failure((error as Error).message);
  }
}

export default cloudflareUpload;
