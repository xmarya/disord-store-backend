import eventBus from "@config/EventBus";
import { createAssistant } from "@repositories/assistant/assistantRepo";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { AssistantDataBody, StoreAssistant } from "@Types/Schema/Users/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewAssistantInStore(storeId: MongoId, assistantData: AssistantDataBody, planId: MongoId) {
  const { firstName, lastName, email, password, permissions, phoneNumber, image } = assistantData;
  const data: StoreAssistant = { userType: "storeAssistant", inStore: storeId, inPlan: planId, firstName, lastName, email, phoneNumber, permissions, credentials: { password }, image };

  const safeCreateAssistant = safeThrowable(
    () => createAssistant(data),
    (error) => new Failure((error as Error).message)
  );

  const createAssistantResult = await extractSafeThrowableResult(() => safeCreateAssistant);

  if (!createAssistantResult.ok) return createAssistantResult;

  const { result } = createAssistantResult;

  const event: AssistantCreatedEvent = {
    type: "assistant.created",
    payload: {
      storeId,
      permissions: result.permissions,
      novuSubscriber: {
        firstName,
        lastName,
        email,
        phoneNumber,
        userType: result.userType,
        id: result.id,
      },
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return createAssistantResult;
}

export default createNewAssistantInStore;
