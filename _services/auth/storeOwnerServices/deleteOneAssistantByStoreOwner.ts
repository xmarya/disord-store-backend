import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
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
    // await deleteAssistantFromStore({ storeId, assistantId, session }); // NOTE: this now a consumer
    if (deletedAssistantResult.ok) {
      const userDeletedEventPayload = {
        usersId: [assistantId as string],
        emailsToDelete: [deletedAssistantResult.result.email],
        userType: deletedAssistantResult.result.userType,
      };

      const assistantDeletedEventPayload = {
        type: "assistant-deleted",
        payload: {
          storeId,
          assistantsId: [assistantId],
        },
      };

      await createOutboxRecord(
        [
          {
            type: "user-deleted",
            payload: userDeletedEventPayload,
          },
          {
            type: "assistant-deleted",
            payload: assistantDeletedEventPayload,
          },
        ],
        session
      );
    }

    return deletedAssistantResult;
  });

  // TODO: publish to rabbit to delete credentials

  return deletedAssistantResult;
}

export default deleteOneAssistantByStoreOwner;
