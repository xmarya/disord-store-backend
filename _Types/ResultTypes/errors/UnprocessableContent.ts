import { ErrorNames, ErrorTemplate } from "./ErrorInfo";


export class UnprocessableContent implements ErrorTemplate {
    readonly ok: false;
    readonly reason: ErrorNames;
    readonly message: string;

    constructor(message?:string) {
        this.ok = false,
        this.reason = "unprocessable-content";
        this.message = message ?? "the received stream content isn't valid"
    }
}