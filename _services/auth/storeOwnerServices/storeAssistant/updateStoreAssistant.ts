import { updateAssistant } from "@repositories/assistant/assistantRepo";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { MongoId } from "@Types/Schema/MongoId";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { StoreAssistant } from "@Types/Schema/Users/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


// TODO write the event to outbox collection
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

  const safeUpdateAssistant = safeThrowable(
    () => updateAssistant(assistantId, storeId, updatedPermissions, updatedDataObj),
    (error) => new Failure((error as Error).message)
  );

  const updateAssistantResult = await extractSafeThrowableResult(() => safeUpdateAssistant);

  if (!updateAssistantResult.ok) return updateAssistantResult;


  return updateAssistantResult;
}

export default updateStoreAssistant;
