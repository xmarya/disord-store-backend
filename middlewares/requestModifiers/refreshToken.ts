import { differenceInMinutes, fromUnixTime } from "date-fns";
import jwt, { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "@utils/catchAsync";
import jwtSignature from "@utils/jwtToken/generateSignature";
import tokenWithCookies from "@utils/jwtToken/tokenWithCookies";

const refreshToken = catchAsync(async (request, response, next) => {
  const { token, user } = request;

  // check if there is a valid token or not
  const decode = jwt.decode(token) as JwtPayload; // returns { id: '', iat: 1751353295, exp: 1751356895 }
  if (!decode || !decode?.exp) return next(); // no need to do anything, if something was wrong with the token, then validateJwtToken middleware had dealt with it before reaching here.
  const expData = fromUnixTime(decode.exp);

  // if there, check its expDate <= 5 ? refresh by 1 hour : next();
  if (differenceInMinutes(expData, new Date()) <= 5) {
    const refreshedToken = jwtSignature(user.id, user.userType, "1h");
    tokenWithCookies(response, refreshedToken);
    response.set("x-refreshed-token", "true");
  }

  next();
});

export default refreshToken;
