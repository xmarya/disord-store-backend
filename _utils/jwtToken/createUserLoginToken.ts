import { getOneDocByFindOne } from "../../_services/global";
import { UserDocument } from "../../_Types/User";
import cacheUser from "../cacheControllers/user";
import jwtSignature from "./generateSignature";
import tokenWithCookies from "./tokenWithCookies";
import type {Response} from "express";


async function createUserLoginToken(user:UserDocument, response:Response) {
  // TODO the below code will be moved to /verify-login-otp, so the token is going to be sent in case the user passes the email-password verification then the otp verification
  //STEP 3) create the token:
  const token = jwtSignature(user.id, "1h");
  tokenWithCookies(response, token);

  // STEP 4) fetching and caching without awaiting
//   const user = await getOneDocByFindOne(User);
  await cacheUser(user);
}

export default createUserLoginToken;