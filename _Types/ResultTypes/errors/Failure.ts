import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { ErrorNames, ErrorTemplate } from "./ErrorInfo";

export class Failure implements ErrorTemplate {
  ok: false;
  reason: ErrorNames;
  message: string;
  constructor(message?:string) {
    this.ok = false;
    this.reason = "error";
    this.message = message ?? INTERNAL_ERROR_MESSAGE;
  }
}