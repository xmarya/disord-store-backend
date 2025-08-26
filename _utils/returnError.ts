import { AppError } from "./AppError";

type ErrorInfo = {
  reason: string;
  message: string;
};
function returnError(errorInfo: ErrorInfo) {
  const { reason, message } = errorInfo;
  const statusCode = reason === "not-found" ? 404 : 500;
  return new AppError(statusCode, message);
}

export default returnError;
