import eventBus from "@config/EventBus";
import { createAssistant } from "@repositories/assistant/assistantRepo";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/MongoId";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { AssistantDataBody, AssistantRegisterData } from "@Types/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import formatAssistantData from "@utils/formatAssistantData";
import safeThrowable from "@utils/safeThrowable";

async function createNewAssistantInStore(storeId: MongoId, assistantData: AssistantDataBody) {
  const { firstName, lastName, email, password, permissions, phoneNumber, image } = assistantData;
  const data: AssistantRegisterData = { userType: "storeAssistant", storeId, firstName, lastName, email, phoneNumber, permissions, credentials: { password }, image };

  const safeCreateAssistant = safeThrowable(
    () => createAssistant(data),
    (error) => new Failure((error as Error).message)
  );

  const createAssistantResult = await extractSafeThrowableResult(() => safeCreateAssistant);

  if (!createAssistantResult.ok) return createAssistantResult;

  const {result} = createAssistantResult;
  const assistantFormattedData = formatAssistantData(result.assistant.permissions, result.user);

  const {_id, id, permissions: fullPermissions, userType} = assistantFormattedData;
  const event: AssistantCreatedEvent = {
    type: "assistant.created",
    payload: {
      storeId,
      permissions: fullPermissions,
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

  const newAssistant = {
    _id,
    id,
    userType,
    firstName,
    lastName,
    email,
    phoneNumber,
    permissions: fullPermissions,
  };
  return { ...createAssistantResult, result: { newAssistant } };
}

export default createNewAssistantInStore;
