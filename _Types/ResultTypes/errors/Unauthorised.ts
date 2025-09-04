import { ErrorNames, ErrorTemplate } from "./ErrorInfo";


export class Unauthorised implements ErrorTemplate {
    readonly ok: false;
    readonly message: string;
    readonly reason: ErrorNames;

    constructor(message:string) {
        this.ok = false;
        this.reason = "unauthorised",
        this.message = message
        
    }
}