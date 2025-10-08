import { FILES_SIGNATURES_IN_HEX } from "@constants/dataStructures";
import { MIME } from "@Types/helperTypes/Files";


function checkFileSignature(mimeType: MIME.Any, fileBuffer: Buffer) {
    const fileType = mimeType.split("/")[1] as keyof typeof FILES_SIGNATURES_IN_HEX;
    const signature = FILES_SIGNATURES_IN_HEX[fileType];
    return fileBuffer.toString("hex").toUpperCase().startsWith(signature);
}

export default checkFileSignature;