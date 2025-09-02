import { Failure } from "@Types/ResultTypes/errors/Failure";
import { NotFound } from "@Types/ResultTypes/errors/NotFound";
import { Success } from "@Types/ResultTypes/Success";
import { ResultAsync } from "neverthrow";

/* NOTE: DON'T GET CONFUSED!!
  Q: why I got the success result that has been extracted from extractSafeThrowableResult  as type ***Documnet | null
   although I filtered the possibilities of null inside the match method using if (!result) return new NotFound();
  
  A: it's because when I refactored the old code, I made ResultAsync to return the exact Types as match() 👉🏻 ResultAsync<T | NotFound, Failure>
  DON'T GET CONFUSED!!
  - ResultAsync<T | null, Failure>: these are the actual possible values that could be returned from the safeResult argument
  - <Success<T> | NotFound , Failure>: these possible TYPES, what I made match() method return depending on the ResultAsync
    ResultAsync<T> matches match<Success<T>>
    ResultAsync<null> matches match<NotFound>
    ResultAsync<Failure> matches match<Failure>

  */

function extractSafeThrowableResult<T>(safeResult: () => ResultAsync<T | null, Failure>) {
  const result = safeResult().match<Success<T> | NotFound, Failure>(
    (result) => {
      if (!result) return new NotFound();
      return new Success(result);
    },
    (error) => {
      return new Failure(error.message);
    }
  );

  return result;
}

export default extractSafeThrowableResult;
