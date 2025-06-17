import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";

const validateJwtToken = catchAsync(async (request, response, next) => {
  console.log(request.method, "|", request.path, "|", request.baseUrl, "|", request.originalUrl);
  let token:string;

  //STEP 1) if there a token in the request.cookies or request headers, get it:
  if (request.cookies.jwt) token = request.cookies.jwt; // priorities the cookies over headers.
  else if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) token = request.headers.authorization.split(" ")[1];
  else return next(new AppError(403, "الرجاء تسجيل الدخول"));

  request.token = token;
  next();
});

export default validateJwtToken
