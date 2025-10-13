import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { ParsedFile } from "@Types/helperTypes/Files";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import uploadFileAndMergeIntoBodyData from "@utils/files/uploadFileAndMergeIntoBodyData";
import { startSession } from "mongoose";
import createOutboxRecord from "./outboxRecordServices/createOutboxRecord";
import updateProfileFactory from "./updateProfileFactory";

async function updateProfile(user: NotAssistant, updatedData: Partial<Omit<BaseUserData, "email">>, emailConfirmed: boolean, parsedFile: Array<ParsedFile>) {
  const { userType, id } = user;
  const { firstName, lastName } = updatedData;
  if (firstName?.trim() === "" || lastName?.trim() === "") return new BadRequest("الرجاء تعبئة حقول الاسم بالكامل");

  const mergedDataResult = await uploadFileAndMergeIntoBodyData("users", id, parsedFile, updatedData);
  if (!mergedDataResult.ok) return mergedDataResult;
  
  const {result: mergedData} = mergedDataResult

  const updateProfileOfUserType = updateProfileFactory(userType);
  const session = await startSession();

  const updatedUserResult = await session.withTransaction(async () => {
    const updatedUserResult = await updateProfileOfUserType(id, mergedData, session);
    if (updatedUserResult.ok) {
      const payload: UserUpdatedEvent["payload"] = {
        user: updatedUserResult.result,
        emailConfirmed,
      };
      await createOutboxRecord<[UserUpdatedEvent]>([{ type: "user-updated", payload }], session);
    }

    return updatedUserResult;
  });

  await session.endSession();

  return updatedUserResult;
}

export default updateProfile;
