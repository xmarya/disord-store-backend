import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import emailChecker from "./emailChecker";
import { startSession } from "mongoose";
import { updateEmail } from "@repositories/credentials/credentialsRepo";
import updateProfileFactory from "@services/_sharedServices/updateProfileFactory";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { MongoId } from "@Types/Schema/MongoId";

async function confirmChangedEmail(newEmail: string, user: NotAssistant) {
  if (!newEmail?.trim()) return new BadRequest("الرجاء تعبئة جميع الحقول");

  const emailCheckerResult = await emailChecker(newEmail);
  if (!emailCheckerResult.ok) return emailCheckerResult;

  const updateProfileOfUserType = updateProfileFactory(user.userType);
  const { email } = user;
  const session = await startSession();
  
  const { updateUserEmailResult } = await session.withTransaction(async () => {
    await updateEmail(email, newEmail, session);
    const updateUserEmailResult = await updateProfileOfUserType(user._id as MongoId, { email: newEmail }, session);
    if (updateUserEmailResult.ok) {
      const payload: UserUpdatedEvent["payload"] = {
        user: updateUserEmailResult.result,
        emailConfirmed: false, // changing the email, resetting the property to false
      };
      await createOutboxRecord<[UserUpdatedEvent]>([{ type: "user-updated", payload }], session);
    }
    return { updateUserEmailResult };
  });

  await session.endSession();

  return updateUserEmailResult;
}

export default confirmChangedEmail;
