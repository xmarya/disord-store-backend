import { ACCEPTED_FILES_MIME, ACCEPTED_IMAGE_MIME } from "@constants/dataStructures";

function checkFileMIME(mimeType: string) {
  return [...ACCEPTED_FILES_MIME, ...ACCEPTED_IMAGE_MIME].includes(mimeType);
}

export default checkFileMIME;