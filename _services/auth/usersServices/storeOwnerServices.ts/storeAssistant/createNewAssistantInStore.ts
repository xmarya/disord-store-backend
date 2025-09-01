import eventBus from "@config/EventBus";
import { createAssistant } from "@repositories/assistant/assistantRepo";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/MongoId";
import { AssistantDataBody, AssistantRegisterData } from "@Types/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewAssistantInStore(storeId: MongoId, assistantData: AssistantDataBody) {
  const { firstName, lastName, email, password, permissions, phoneNumber } = assistantData;
  const data: AssistantRegisterData = { userType: "storeAssistant", storeId, firstName, lastName, email, phoneNumber, permissions, credentials: { password } };

  const safeCreateAssistant = safeThrowable(
    () => createAssistant(data),
    (error) => new Error((error as Error).message)
  );

  const createAssistantResult = await extractSafeThrowableResult(() => safeCreateAssistant);

  if (!createAssistantResult.ok) return createAssistantResult;

  const {
    result: {
      user: { id, userType },
    },
  } = createAssistantResult;
  const event: AssistantCreatedEvent = {
    type: "assistant.created",
    payload: {
      storeId,
      permissions,
      novuSubscriber: {
        firstName,
        lastName,
        email,
        phoneNumber,
        userType,
        id,
      },
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  const { user, assistant } = createAssistantResult.result;
  const newAssistant = {
    _id: user._id,
    id: user.id,
    userType,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    permissions: assistant.permissions,
  };
  return { ...createAssistantResult, result: { newAssistant } };
}

export default createNewAssistantInStore;
