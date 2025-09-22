import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { MongoId } from "@Types/Schema/MongoId";
import extractUsersEmailAndId from "@utils/extractUsersEmailAndId";
import { startSession } from "mongoose";
import deleteAllAssistantsAccounts from "./storeAssistant/deleteAllAssistantsAccounts";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";

async function deleteAllAssistantsByStoreOwner(storeId: MongoId) {
  const session = await startSession();

  const deleteAllAssistantsResult = await session.withTransaction(async () => {
    const deleteAllAssistantsResult = await deleteAllAssistantsAccounts(storeId, session);

    if (deleteAllAssistantsResult.ok) {
      const {result: {assistantsEmails, deletedAssistants}} = deleteAllAssistantsResult;
      if(!deletedAssistants.acknowledged) return new Failure();
      const { ids, emails } = await extractUsersEmailAndId(assistantsEmails);
      const userDeletedPayload = { usersId: ids, emailsToDelete: emails, userType: "storeAssistant" };
      const assistantDeletedPayload = { assistantsId: ids, storeId };
      await createOutboxRecord(
        [
          { type: "user-deleted", payload: userDeletedPayload },
          { type: "assistant-deleted", payload: assistantDeletedPayload },
        ],
        session
      );
    }

    return deleteAllAssistantsResult;
  });

  await session.endSession();

  return deleteAllAssistantsResult;
}

export default deleteAllAssistantsByStoreOwner;
