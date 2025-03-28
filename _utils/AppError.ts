// handles edge-cases
export class AppError extends Error {
  StatusCode: number;
  status: string;
  isOperational: boolean;
  constructor(StatusCode: number, message: string) {
    super(message);
    this.StatusCode = StatusCode;
    this.status = `${StatusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    //currentObj, AppError class itself
    Error.captureStackTrace(this, this.constructor);
  }
}

/*
    Error.captureStackTrace(targetObject[, constructorOpt])
    targetObject <Object>
    constructorOpt <Function>
    Creates a .stack property on targetObject, which when accessed returns a string representing the location in the code at which Error.captureStackTrace() was called.
    doc: https://nodejs.org/dist/latest-v10.x/docs/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
*/
