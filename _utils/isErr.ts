import { Err } from "neverthrow";


function isErr<T, E>(value:any): value is Err<T,E> {
    return value && typeof value === "object" && "isErr" in value
}

export default isErr;