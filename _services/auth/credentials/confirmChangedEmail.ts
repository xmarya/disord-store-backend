import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import emailChecker from "./emailChecker";
import { startSession } from "mongoose";
import { updateEmail } from "@repositories/credentials/credentialsRepo";
import updateProfileFactory from "@services/_sharedServices/updateProfileFactory";

async function confirmChangedEmail(newEmail: string, user: NotAssistant) {
  if (!newEmail?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول");

  const emailCheckerResult = await emailChecker(newEmail);
  if (!emailCheckerResult.ok) return emailCheckerResult;

  const { email } = user;
  const session = await startSession();
  const {updateUserEmailResult} = await session.withTransaction(async () => {
    await updateEmail(email, newEmail, session);
    const updateUserEmailResult = await updateProfileFactory(user, { email: newEmail }, session);
    return { updateUserEmailResult };
  });

  return updateUserEmailResult;
}

export default confirmChangedEmail;
