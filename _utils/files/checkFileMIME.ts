import { ACCEPTED_FILES_MIME, ACCEPTED_IMAGE_MIME, ACCEPTED_SVG_MIME } from "@constants/dataStructures";
import { MIME } from "@Types/helperTypes/Files";

function checkFileMIME(mimeType: MIME.Any) {
  return [...ACCEPTED_FILES_MIME, ...ACCEPTED_IMAGE_MIME, ...ACCEPTED_SVG_MIME].includes(mimeType);
}

export default checkFileMIME;