import novu from "@config/novu";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { AssistantPermissions, StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuUpdateSubscriber(event:UserUpdatedEvent) {
  const {_id, id, email, firstName, lastName, phoneNumber} = event.payload.user;
  const {permissions} = event.payload.user as StoreAssistantDocument;
  const subscriberId = id ?? (_id as MongoId).toString();

  const payload: Record<string, any> = {
    ...(email && { email }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(phoneNumber && { phone: phoneNumber }),
  };

  const moreData = {
    ...(permissions && { permissions }),
  };

  if (Object.keys(moreData).length) payload.user = moreData;

  const safeUpdateNovu = safeThrowable(
    () => novu.subscribers.patch(payload, subscriberId),
    (error) => new Failure((error as Error).message, {serviceName:"novu", ack: false})
  );

  const novuResult = await extractSafeThrowableResult(() => safeUpdateNovu);
  if(!novuResult.ok) return new Failure(novuResult.message, {serviceName:"novu", ack: false});

  return new Success({serviceName:"novu", ack: true})

}

export default novuUpdateSubscriber;
