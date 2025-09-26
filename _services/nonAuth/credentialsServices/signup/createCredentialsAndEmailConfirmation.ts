import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { CredentialsSignupData } from "@Types/Schema/Users/SignupData";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import generateEmailConfirmationToken from "@utils/generators/generateEmailConfirmationToken";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function createCredentialsAndEmailConfirmation(signupData: CredentialsSignupData, session: mongoose.ClientSession, emailTokenGenerator: { hostname: string; protocol: string }) {
  const safeCreateCredentials = safeThrowable(
    () => createNewCredentials(signupData, session),
    (error) => new Failure((error as Error).message)
  );

  const createCredentialsResult = await extractSafeThrowableResult(() => safeCreateCredentials);
  if (!createCredentialsResult.ok) return createCredentialsResult;

  const {result: newCredentials} = createCredentialsResult
  // confirmUrl for novu, randomToken from redis
  const { confirmUrl, randomToken } = await generateEmailConfirmationToken(newCredentials, emailTokenGenerator);

  return new Success({credentialsId: newCredentials._id as string, confirmUrl, randomToken})
}

export default createCredentialsAndEmailConfirmation;
