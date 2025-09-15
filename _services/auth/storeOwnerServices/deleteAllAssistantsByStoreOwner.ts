import { MongoId } from "@Types/Schema/MongoId";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import extractUsersEmailAndId from "@utils/extractUsersEmailAndId";
import { startSession } from "mongoose";
import deleteAllAssistantsAccounts from "./storeAssistant/deleteAllAssistantsAccounts";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";

async function deleteAllAssistantsByStoreOwner(storeId: MongoId) {
  const session = await startSession();

  const deleteAllAssistantsResult = await session.withTransaction(async () => {
    const deleteAllAssistantsResult = await deleteAllAssistantsAccounts(storeId, session);

    if (deleteAllAssistantsResult.ok) {
      const { ids, emails } = await extractUsersEmailAndId(deleteAllAssistantsResult.result);
      const payload = { usersId: ids, emailsToDelete: emails };
      await createOutboxRecord<UserDeletedEvent>("user-deleted", payload, session);
    }

    return deleteAllAssistantsResult;
  });

  return deleteAllAssistantsResult;
}

export default deleteAllAssistantsByStoreOwner;
