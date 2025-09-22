import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import updateProfileFactory from "./updateProfileFactory";
import { startSession } from "mongoose";
import createOutboxRecord from "./outboxRecordServices/createOutboxRecord";
import { UserUpdatedEvent } from "@Types/events/UserEvents";

async function updateProfile(user: NotAssistant, updatedData: Partial<BaseUserData>, emailConfirmed:boolean) {
  const { userType, id } = user;
  const { firstName, lastName } = updatedData;
  if (firstName?.trim() === "" || lastName?.trim() === "") return new BadRequest("الرجاء تعبئة حقول الاسم بالكامل");

  const updateProfileOfUserType = updateProfileFactory(userType);
  const session = await startSession();

  const updatedUserResult = await session.withTransaction(async()=> {
    const updatedUserResult = await updateProfileOfUserType(id, updatedData, session);
    if(updatedUserResult.ok) {
      const payload:UserUpdatedEvent["payload"] = {
        user: updatedUserResult.result,
        emailConfirmed
      }
      await createOutboxRecord<[UserUpdatedEvent]>([{type: "user-updated", payload}], session);
    }

    return updatedUserResult
  });

  await session.endSession();

  return updatedUserResult
}

export default updateProfile;
