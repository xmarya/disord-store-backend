import { ErrorNames, ErrorTemplate } from "./ErrorInfo";

export class Forbidden implements ErrorTemplate {
  ok: false;
  reason: ErrorNames;
  message: string;

  constructor(message?: string) {
    this.ok = false;
    this.reason = "forbidden";
    this.message = message ?? "غير مصرح لك الوصول";
  }
}