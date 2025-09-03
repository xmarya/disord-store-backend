export type ErrorNames = "not-found" | "bad-request" | "unauthorised" | "forbidden" | "error";
export type ErrorInfo = {
  reason: ErrorNames;
  message: string;
};

// export interface ResultTemplate {
//   ok:boolean,
//   result:any | never,
//   reason: ErrorNames | never;
//   message: string | never;
// }

export interface ErrorTemplate {
  readonly ok: false;
  readonly reason: ErrorNames;
  readonly message: string;
  
}
