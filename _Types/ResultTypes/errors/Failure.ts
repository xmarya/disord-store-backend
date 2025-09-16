import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { ErrorNames, ErrorTemplate } from "./ErrorInfo";

export class Failure implements ErrorTemplate {
  ok: false;
  reason: ErrorNames;
  message: string;
  DTO:Record<string,any>
  constructor(message?:string, DTO?:Record<string,any>) {
    this.ok = false;
    this.reason = "error";
    this.message = message ?? INTERNAL_ERROR_MESSAGE;
    this.DTO = DTO ?? {};
  }

  getFailureDTO() {
    return this.DTO;
  }
}