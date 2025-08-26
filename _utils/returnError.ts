import { AppError } from "./AppError";

type ErrorInfo = {
  reason: string;
  message: string;
};

function getCodeStatus(reason:string) {
  switch (reason) {
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
