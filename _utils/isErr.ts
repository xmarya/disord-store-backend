import { Err } from "neverthrow";


//TODO: move it to old folder after completing the refactor process
function isErr<T, E>(value:any): value is Err<T,E> {
    return value && typeof value === "object" && "isErr" in value
}

export default isErr;