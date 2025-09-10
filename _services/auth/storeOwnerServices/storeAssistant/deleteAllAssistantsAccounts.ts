import eventBus from "@config/EventBus";
import { deleteAllAssistants } from "@repositories/assistant/assistantRepo";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import extractUsersEmailAndId from "@utils/extractUsersEmailAndId";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";

async function deleteAllAssistantsAccounts(storeId: MongoId, session?: mongoose.ClientSession) {
  const safeDeleteAllAssistants = safeThrowable(
    // TODO write to outbox
    () => deleteAllAssistants(storeId, session),
    (error) => new Failure((error as Error).message)
  );

  const deleteAllAssistantsResult = await extractSafeThrowableResult(() => safeDeleteAllAssistants);
  if(!deleteAllAssistantsResult.ok) return deleteAllAssistantsResult;

    const {result: deletedAssistantsDocs} = deleteAllAssistantsResult;
    const {ids, emails} = extractUsersEmailAndId(deletedAssistantsDocs);
    const event:UserDeletedEvent = {
      type:"user.deleted",
      payload: {
        usersId: ids,
        emailsToDelete:emails
      },
      occurredAt: new Date()
    }

    eventBus.publish(event);

}

export default deleteAllAssistantsAccounts;
