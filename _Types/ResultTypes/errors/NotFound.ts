import { NOT_FOUND_ERROR_MESSAGE } from "@constants/primitives";
import { ErrorNames, ErrorTemplate } from "./ErrorInfo";

export class NotFound implements ErrorTemplate {
  ok: false;
  reason: ErrorNames;
  message: string;

  constructor(message?:string) {
    this.ok = false;
    this.reason = "not-found";
    this.message = message ?? NOT_FOUND_ERROR_MESSAGE;
  }
}