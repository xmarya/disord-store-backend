import { INTERNAL_ERROR_MESSAGE } from "@constants/primitives";
import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreDeletedEvent } from "@Types/events/StoreEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractUsersEmailAndId from "@utils/extractUsersEmailAndId";
import mongoose, { startSession } from "mongoose";

async function deleteAllStoreAssistants(event: StoreDeletedEvent) {
  const { storeId } = event.payload;
  const store = new mongoose.Types.ObjectId(storeId);
  const session = await startSession();

  const deleteResult = await session.withTransaction(async () => {
    const { assistantsEmails, deletedAssistants } = await deleteAllAssistants(store, session);
    if (!deletedAssistants.acknowledged) return new Failure(INTERNAL_ERROR_MESSAGE, { serviceName: "assistantsCollection", ack: false });

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

    return new Success({ serviceName: "assistantsCollection", ack: false });;
  });

  await session.endSession();


  return deleteResult;
}

export default deleteAllStoreAssistants;
