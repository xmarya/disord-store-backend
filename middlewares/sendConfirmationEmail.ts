import Credentials from "@models/credentialsModel";
import { getOneDocByFindOne } from "@repositories/global";
import { EmailConfirmationSentEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { catchAsync } from "@utils/catchAsync";
import generateEmailConfirmationToken from "@utils/generators/generateEmailConfirmationToken";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import returnError from "@utils/returnError";
import safeThrowable from "@utils/safeThrowable";
import eventBus from "@config/EventBus";

export const sendConfirmationEmail = catchAsync(async (request, response, next) => {
  const { email } = request.user;

  const safeGetCredentials = safeThrowable(
    () => getOneDocByFindOne(Credentials, { condition: { email } }),
    (error) => new Failure((error as Error).message)
  );
  const credentialsResult = await extractSafeThrowableResult(() => safeGetCredentials);
  if (!credentialsResult.ok) return next(returnError(credentialsResult));

  const emailTokenGenerator = { hostname: request.hostname, protocol: request.protocol };
  const { confirmUrl, randomToken } = await generateEmailConfirmationToken(credentialsResult.result, emailTokenGenerator);

  const event: EmailConfirmationSentEvent = {
    type: "emailConfirmation-sent",
    payload: {
      credentialsId: credentialsResult.result.id,
      userType: credentialsResult.result.userType,
      randomToken,
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  response.status(200).json({
    success: true,
    data: { confirmUrl },
  });
});
