import { ErrorNames, ErrorTemplate } from "./ErrorInfo";


export class ContentTooLarge implements ErrorTemplate {
    readonly ok: false;
    readonly reason: ErrorNames;
    readonly message: string;

    constructor(message:string) {
        this.ok = false;
        this.reason = "content-too-large";
        this.message = message;
    }
}