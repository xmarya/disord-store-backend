import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { ErrorNames, ErrorTemplate } from "./ErrorInfo";

type DTOs = RabbitConsumerDTO

export type RabbitConsumerDTO = {serviceName:string, ack:boolean}
export class Failure implements ErrorTemplate {
  ok: false;
  reason: ErrorNames;
  message: string;
  DTO:DTOs | undefined;
  constructor(message?:string, DTO?:DTOs) {
    this.ok = false;
    this.reason = "error";
    this.message = message ?? INTERNAL_ERROR_MESSAGE;
    this.DTO = DTO;
  }

  getFailureDTO() {
    return this.DTO;
  }
}