import { ErrorNames } from "@Types/ErrorNames";
import { AppError } from "./AppError";

type ErrorInfo = {
  reason: ErrorNames;
  message: string;
};

function getCodeStatus(reason:ErrorNames) {
  switch (reason) {
    case "bad-request":
      return 400;

    case "not-found":
      return 404;
    
    case "forbidden": 
      return 403;
      
    default:
      return 500;
  }
}
function returnError(errorInfo: ErrorInfo) {
  const { reason, message } = errorInfo;
  const statusCode = getCodeStatus(reason);
  return new AppError(statusCode, `${reason}: ${message}`);
}

export default returnError;
