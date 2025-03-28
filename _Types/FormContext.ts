import { ZodError } from "zod";
import { InputStatusCode } from "./FormContextInput";

export type FormSuccessResponse = {
  success: true;
  code: "valid" | "noChange";
};

export type FormErrorResponse = {
  success: false;
  code: "error";
  errors:ZodError;
  // errors: {
  //   [k: string]: string[] | undefined;
  // }; // Both give me the same results but I preferred the first since it shows me that its type is ZodError explicitly
  rawData: {
    [k: string]: FormDataEntryValue;
  };
};

export type FormState = FormSuccessResponse | FormErrorResponse

// type FormSuccessResponse<T> = SafeParseSuccess<T> & {
//   code: "valid" | "noChange";
// };

// type FormErrorResponse <T> = SafeParseError <T> & {
//   code: "error";
//   rawData: Record<string, FormDataEntryValue>
// };

// export type FormState <T> = FormSuccessResponse <T> | FormErrorResponse <T>;

// export type FormState = {
//   success: boolean;
//   message?: string;
//   errors: {
//     [k: string]: string[] | undefined;
//   };
//   code: Extract<InputStatusCode, "error">; // Pick<> doesn't work with union types, that's why I ended up with Extract<>
//   rawData: {
//     [k: string]: FormDataEntryValue;
//   };
// };

// type FormStateResponse = {
//     success:boolean,
//     errors:Record<string, any> | null,
//     message?:string,
//     rawData?: {
//         [k: string]: FormDataEntryValue;
//     }
// }

export type ContextProps = {
  register: (name: string) => (code: InputStatusCode) => void;
  isFormValid: boolean;
  // formState: {
  //     success:boolean,
  //     errors:Array<{}> | null,
  //     message?:string,
  //     rawData?: {
  //         [k: string]: FormDataEntryValue;
  //     }
  // }
  // formState: void | null | FormStateResponse,
};
