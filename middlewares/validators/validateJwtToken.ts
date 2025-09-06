import { Forbidden } from "@Types/ResultTypes/errors/Forbidden";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const validateJwtToken = catchAsync(async (request, response, next) => {
  let token: string;

  //STEP 1) if there a token in the request.cookies or request headers, get it:
  if (request.cookies.jwt) token = request.cookies.jwt; // priorities the cookies over headers.
  else if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) token = request.headers.authorization.split(" ")[1];
  else return next(returnError(new Forbidden("الرجاء تسجيل الدخول")));

  request.token = token;
  next();
});

export default validateJwtToken;
