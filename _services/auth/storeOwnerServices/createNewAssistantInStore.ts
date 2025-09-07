import eventBus from "@config/EventBus";
import { createAssistant } from "@repositories/assistant/assistantRepo";
import { createNewCredentials } from "@repositories/credentials/credentialsRepo";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { AssistantDataBody, StoreAssistant } from "@Types/Schema/Users/StoreAssistant";
import { startSession } from "mongoose";
import createNewAssistant from "./storeAssistant/createNewAssistant";

async function createNewAssistantInStore(storeId: MongoId, assistantData: AssistantDataBody, planId: MongoId) {
  const { firstName, lastName, email, password, permissions, phoneNumber, image } = assistantData;
  const data: StoreAssistant = { userType: "storeAssistant", inStore: storeId, inPlan: planId, firstName, lastName, email, phoneNumber, permissions, image };

  const session = await startSession();
  const { newAssistantResult } = await session.withTransaction(async () => {
    const newAssistantResult = await createNewAssistant(data, session);
    await createNewCredentials({ email, password, firstName, lastName, userType: data.userType, phoneNumber }, session);

    return { newAssistantResult };
  });

  if(!newAssistantResult.ok) return newAssistantResult;

  const {result: newAssistant} = newAssistantResult;

  const event: AssistantCreatedEvent = {
    type: "assistant.created",
    payload: {
      storeId,
      permissions: newAssistant.permissions,
      novuSubscriber: {
        firstName,
        lastName,
        email,
        phoneNumber,
        userType: newAssistant.userType,
        id: newAssistant.id,
      },
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return newAssistantResult;
}

export default createNewAssistantInStore;
