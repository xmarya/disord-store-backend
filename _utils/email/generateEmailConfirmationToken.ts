import type { Request } from "express";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";
import { generateRandomToken } from "../generateRandomToken";
import { createRedisHash } from "../../externals/redis/redisOperations/redisHash";

async function generateEmailConfirmationToken(user: UserDocument | AdminDocument, request: Request) {
  const randomToken = await generateRandomToken(user, "emailConfirmation");
  // const uniqueEmailId = crypto.randomUUID();
  // NOTE: using a unique id prevents transaction emails to be threaded in the inbox,
  //  sending it within the request header tells that this email message is unique => https://youtu.be/FA2Axy_aKq8?si=t113reo4hNT0-jzN&t=193
  const confirmUrl = `${request.protocol}://${request.hostname}/api/v1/auth/confirmEmail/${randomToken}`;

  const key = `Email:${randomToken.slice(0, 12)}`;
  const data = {
    id: user.id,
    userType: user.userType,
  };

  await createRedisHash(key, data, "one-hour");

  return confirmUrl;
}

export default generateEmailConfirmationToken;
