import { FILES_SIGNATURES_IN_HEX } from "@constants/dataStructures";
import { MIME } from "@Types/helperTypes/Files";


function checkFileSignature(mimeType: MIME.Any, fileBuffer: Buffer) {
    const fileType = mimeType.split("/")[1] as keyof typeof FILES_SIGNATURES_IN_HEX;
    const signature = FILES_SIGNATURES_IN_HEX[fileType];
    const correctSignature = fileBuffer.toString("hex").slice(0, signature.length).toUpperCase().startsWith(signature);
    return correctSignature ? fileBuffer : undefined;
}

export default checkFileSignature;