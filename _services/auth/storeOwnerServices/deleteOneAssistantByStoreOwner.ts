import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";
import deleteAssistantAccount from "./storeAssistant/deleteAssistantAccount";
import deleteAssistantFromStore from "../storeServices/deleteAssistantFromStore";
import { deleteCredentials } from "@repositories/credentials/credentialsRepo";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import eventBus from "@config/EventBus";

type Arguments = {
  storeId: MongoId;
  assistantId: MongoId;
};

async function deleteOneAssistantByStoreOwner(data:Arguments) {
    const {assistantId, storeId} = data
    const session = await startSession();

    const deletedAssistantResult =  await session.withTransaction(async() => {
        const deletedAssistantResult = await deleteAssistantAccount({assistantId, storeId, session});
        await deleteAssistantFromStore({storeId, assistantId, session});
        if(deletedAssistantResult.ok) await deleteCredentials(deletedAssistantResult.result.email, session);

        return deletedAssistantResult
    });

    if(!deletedAssistantResult.ok) return deletedAssistantResult;

    const {result: deletedAssistant} = deletedAssistantResult;

    const event:UserDeletedEvent = {
        type:"user.deleted",
        payload: {
            userId:assistantId
        },
        occurredAt: new Date()
    }

    eventBus.publish(event);

    return deletedAssistantResult;
}

export default deleteOneAssistantByStoreOwner;