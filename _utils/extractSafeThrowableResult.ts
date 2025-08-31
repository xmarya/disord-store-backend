import { NOT_FOUND_ERROR_MESSAGE } from "@constants/primitives";
import { ResultAsync } from "neverthrow";

type SafeThrowableResult<T> = { ok: true; result: T } | { ok: false; reason: "not-found"; message:string  } | { ok: false; reason: "error"; message: string };

function extractSafeThrowableResult<T>(safeResult: () => ResultAsync<T | null, Error>) {
  const result = safeResult().match<SafeThrowableResult<T>>(
    (result) => {
      if (!result) return { ok: false, reason: "not-found", message: NOT_FOUND_ERROR_MESSAGE };
      return { ok: true, result };
    },
    (error) => {
      return { ok: false, reason: "error", message: error.message };
    }
  );

  return result;
}


export default extractSafeThrowableResult;