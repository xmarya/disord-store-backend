import { Failure } from "@Types/ResultTypes/errors/Failure";
import { ResultAsync } from "neverthrow";

function safeThrowable<R, E extends Failure>(throwableFn: () => Promise<R>, throwHandler: (error:unknown) => E):ResultAsync<R, E> {
    return ResultAsync.fromThrowable(throwableFn, (error:unknown) => {
        console.log("safeThrowable Error", error);
        return throwHandler(error);
    } )();
}

export default safeThrowable;