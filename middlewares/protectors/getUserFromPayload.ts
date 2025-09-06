import getUserFromCacheOrDB from "@services/_sharedServices/getUserFromCacheOrDB";
import { Unauthorised } from "@Types/ResultTypes/errors/Unauthorised";
import { catchAsync } from "@utils/catchAsync";
import jwtVerify from "@utils/jwtToken/jwtVerify";
import returnError from "@utils/returnError";


const getUserFromPayload = catchAsync(async (request, response, next) => {
  // STEP 2) validate the token:
  const payload = await jwtVerify(request.token, process.env.JWT_SALT!);

  const result = await getUserFromCacheOrDB(payload.id, payload.userType);

  if(!result.ok) return next(returnError(result));

  const {result: user} = result;

  if(user instanceof Unauthorised) return next(returnError(user));

  request.user = user;
  next();
});


export default getUserFromPayload;
