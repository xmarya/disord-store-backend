import type { Response } from "express";
import { getOneDocByFindOne, getOneDocById } from "../../_repositories/global";
import { AdminDocument } from "../../_Types/admin/AdminUser";
import { UserDocument } from "../../_Types/User";
import User from "../../models/userModel";
import cacheUser from "../../externals/redis/cacheControllers/user";
import createNovuSubscriber from "../../externals/novu/subscribers/createSubscriber";
import jwtSignature from "./generateSignature";
import tokenWithCookies from "./tokenWithCookies";
import Admin from "../../models/adminModel";
import { AppError } from "../AppError";

async function createUserLoginToken(response: Response, condition: Record<string, string | undefined>) {
  const loggedInUser = (await getOneDocByFindOne(User, { condition })) ?? (await getOneDocByFindOne(Admin, { condition }));

  if (loggedInUser) {
    //STEP 3) create the token:
    const token = jwtSignature(loggedInUser.id, "1h");
    tokenWithCookies(response, token);

    // STEP 4) fetching and caching without awaiting
    await cacheUser(loggedInUser);
  } else throw new AppError(400, "Couldn't generate login token. Please try to login again.");
}

export default createUserLoginToken;
