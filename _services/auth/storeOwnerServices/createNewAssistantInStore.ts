import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { AssistantDataBody, StoreAssistant } from "@Types/Schema/Users/StoreAssistant";
import { startSession } from "mongoose";
import createNewAssistant from "./storeAssistant/createNewAssistant";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";

async function createNewAssistantInStore(storeId: MongoId, assistantData: AssistantDataBody, planId: MongoId) {
  const { firstName, lastName, email, password, permissions, phoneNumber, avatar } = assistantData;
  const data: StoreAssistant = { userType: "storeAssistant", inStore: storeId, inPlan: planId, firstName, lastName, email, phoneNumber, permissions, avatar };

  const session = await startSession();
  const newAssistantResult = await session.withTransaction(async () => {
    const newAssistantResult = await createNewAssistant(data, session);
    await createNewCredentials({ email, password, firstName, lastName, userType: data.userType, phoneNumber }, session);
    if(newAssistantResult.ok) {

      const payload:AssistantCreatedEvent["payload"] = {
        storeId,
        permissions: newAssistantResult.result.permissions,
        novuSubscriber: {
          firstName,
          lastName,
          email,
          phoneNumber,
          userType: newAssistantResult.result.userType,
          id: newAssistantResult.result.id,
        },
      }
      await createOutboxRecord<[AssistantCreatedEvent]>([{type:"assistant-created", payload }],session)
    }
    return newAssistantResult;
  });

  await session.endSession();

  return newAssistantResult;
}

export default createNewAssistantInStore;
