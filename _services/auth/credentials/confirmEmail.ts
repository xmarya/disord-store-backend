import { TokenSlicer } from "@constants/dataStructures";
import { getRedisHash } from "@externals/redis/redisOperations/redisHash";
import { confirmUserEmail } from "@repositories/credentials/credentialsRepo";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import crypto from "crypto";

async function confirmEmail(randomToken: string) {
  const slicedToken = randomToken.slice(TokenSlicer.from, TokenSlicer.to);
  const data: { id: string; userType: UserTypes } | null = await getRedisHash(`EmailConfirm:${slicedToken}`);

  if (!data) return new BadRequest("انتهت المدة المسموحة لرابط التفعيل");

  const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");

  const safeConfirmEmail = safeThrowable(
    () => confirmUserEmail(data.id, hashedToken, data.userType),
    (error) => new Failure((error as Error).message)
  );

  const confirmResult = await extractSafeThrowableResult(() => safeConfirmEmail);
  if (!confirmResult.ok) return confirmResult;

  return new Success("تم تأكيد بريدك الإلكتروني بنجاح");
}

export default confirmEmail;
