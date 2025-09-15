import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import deleteAssistantFromStore from "../storeServices/deleteAssistantFromStore";
import deleteAssistantAccount from "./storeAssistant/deleteAssistantAccount";

type Arguments = {
  storeId: MongoId;
  assistantId: MongoId;
};

async function deleteOneAssistantByStoreOwner(data: Arguments) {
  const { assistantId, storeId } = data;
  const session = await startSession();

  const deletedAssistantResult = await session.withTransaction(async () => {
    const deletedAssistantResult = await deleteAssistantAccount({ assistantId, storeId, session });
    await deleteAssistantFromStore({ storeId, assistantId, session });
    if (deletedAssistantResult.ok) {
      const payload = {
        usersId: [assistantId as string],
        emailsToDelete: [deletedAssistantResult.result.email],
      };
      await createOutboxRecord<UserDeletedEvent>("user-deleted", payload, session);
    }

    return deletedAssistantResult;
  });

  return deletedAssistantResult;
}

export default deleteOneAssistantByStoreOwner;
