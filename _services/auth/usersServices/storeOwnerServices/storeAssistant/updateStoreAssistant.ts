import eventBus from "@config/EventBus";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/MongoId";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Success } from "@Types/ResultTypes/Success";
import { StoreAssistant as StoreAssistantData } from "@Types/StoreAssistant";
import { RegularUser } from "@Types/User";
import formatAssistantData from "@utils/formatAssistantData";
import updateUserProfile from "../../updateUserProfile";
import getOneAssistant from "./getOneAssistant";
import getUserProfile from "../../getUserProfile";
import updatePermissions from "./updatePermissions";

async function updateStoreAssistant(assistantId: MongoId, storeId: MongoId, updatedData: Partial<RegularUser & Pick<StoreAssistantData, "permissions">>) {
  if (!Object.keys(updatedData).length) return new BadRequest("no data was provided in the request.body");
  
  const { permissions } = updatedData;

  const safeAssistantResult = permissions ? await updatePermissions(assistantId, storeId, permissions) : await getOneAssistant(assistantId, storeId);

  if (!safeAssistantResult.ok) return safeAssistantResult;

  const otherData: Record<string, any> = {};
  for (const [key, value] of Object.entries(updatedData)) {
    if (typeof value === "string" && value.trim()) otherData[key] = value.trim();
  }

  const safeOtherDataResult = Object.keys(otherData).length ? await updateUserProfile(assistantId, otherData) : await getUserProfile(assistantId);
    if (!safeOtherDataResult.ok) return safeOtherDataResult;

  const updatedAssistant = formatAssistantData(safeAssistantResult.result.permissions, safeOtherDataResult.result);

  const event: AssistantUpdatedEvent = {
    type: "assistant.updated",
    payload: {
      assistantId,
      storeId,
      permissions: updatedAssistant.permissions,
      novuSubscriber: {
        firstName: updatedAssistant.firstName,
        lastName: updatedAssistant.lastName,
        email: updatedAssistant.email,
        phoneNumber: updatedAssistant.phoneNumber,
        userType: updatedAssistant.userType,
        id: assistantId
      },
    },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return new Success(updatedAssistant);
}


export default updateStoreAssistant;
