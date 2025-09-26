import { updateAssistant } from "@repositories/assistant/assistantRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreAssistant } from "@Types/Schema/Users/StoreAssistant";
import { startSession } from "mongoose";


async function updateStoreAssistant(assistantId: MongoId, storeId: MongoId, updatedData: Partial<Omit<StoreAssistant, "credentials" | "userType" | "inStore" | "inPlan">>) {
  if (!Object.keys(updatedData).length) return new BadRequest("no data was provided in the request.body");

  const { permissions } = updatedData;
  const updatedPermissions: Record<string, any> = {};

  permissions &&
    Object.entries(permissions).map(([key, value]) => {
      updatedPermissions[`permissions.${key}`] = value;
    });

  const updatedDataObj: Record<string, any> = {
    ...(updatedData.firstName && { firstName: updatedData.firstName }),
    ...(updatedData.lastName && { lastName: updatedData.lastName }),
    ...(updatedData.phoneNumber && { phoneNumber: updatedData.phoneNumber }),
    ...(updatedData.image && { image: updatedData.image }),
    ...(updatedData.email && { email: updatedData.email }),
  };

  const session = await startSession();

  const updatedAssistants = await session.withTransaction(async() => {

    const updatedAssistants = await updateAssistant(assistantId, storeId, updatedPermissions, updatedDataObj, session);
    if(updatedAssistants) {
      const payload:AssistantUpdatedEvent["payload"] = {
        user:updatedAssistants,
        storeId,
        permissions:updatedAssistants?.permissions
      }
      await createOutboxRecord<[AssistantUpdatedEvent]>([{type:"assistant-updated", payload}], session);
    }

    return updatedAssistants;
  })

  await session.endSession();

  if (!updatedAssistants) return new Failure()


  return new Success({updatedAssistants});
}

export default updateStoreAssistant;
