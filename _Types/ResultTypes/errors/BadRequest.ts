import { ErrorNames, ErrorTemplate } from "./ErrorInfo";


export class BadRequest implements ErrorTemplate {
    readonly ok: false;
    readonly message: string;
    readonly reason: ErrorNames;

    constructor(message:string) {
        this.ok = false;
        this.reason = "bad-request",
        this.message = message
        
    }
}