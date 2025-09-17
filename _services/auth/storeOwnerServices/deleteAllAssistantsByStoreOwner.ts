import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { MongoId } from "@Types/Schema/MongoId";
import extractUsersEmailAndId from "@utils/extractUsersEmailAndId";
import { startSession } from "mongoose";
import deleteAllAssistantsAccounts from "./storeAssistant/deleteAllAssistantsAccounts";
import { UserDeletedEvent } from "@Types/events/UserEvents";

async function deleteAllAssistantsByStoreOwner(storeId: MongoId) {
  const session = await startSession();

  const deleteAllAssistantsResult = await session.withTransaction(async () => {
    const deleteAllAssistantsResult = await deleteAllAssistantsAccounts(storeId, session);

    if (deleteAllAssistantsResult.ok) {
      const { ids, emails } = await extractUsersEmailAndId(deleteAllAssistantsResult.result);
      const userDeletedPayload = { usersId: ids, emailsToDelete: emails, userType: deleteAllAssistantsResult.result[0].userType  };
      const assistantDeletedPayload =  {assistantsId: ids, storeId}
      await createOutboxRecord([{type:"user-deleted", payload:userDeletedPayload}, {type:"assistant-deleted", payload: assistantDeletedPayload}], session);
    }

    return deleteAllAssistantsResult;
  });

  return deleteAllAssistantsResult;
}

export default deleteAllAssistantsByStoreOwner;
