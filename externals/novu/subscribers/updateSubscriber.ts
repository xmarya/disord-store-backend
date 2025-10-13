import novu from "@config/novu";
import { AssistantUpdatedEvent } from "@Types/events/AssistantEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuUpdateSubscriber(event:UserUpdatedEvent | AssistantUpdatedEvent) {
  const {_id, id, email, firstName, lastName, phoneNumber, userType} = event.payload.user;
  const {permissions, inStore} = event.payload.user as StoreAssistantDocument;
  const {myStore} = event.payload.user as StoreOwnerDocument;
  const subscriberId = id ?? (_id as MongoId).toString();

  const payload: Record<string, any> = {
    ...(email && { email }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(phoneNumber && { phone: phoneNumber }),
  };

  const store = (myStore || inStore)
  const moreData = {
    userType,
    ...(store && { store: store.toString() }),
    ...(permissions && { permissions }),
  };

  if (Object.keys(moreData).length) payload.data = moreData;

  const safeUpdateNovu = safeThrowable(
    () => novu.subscribers.patch(payload, subscriberId),
    (error) => new Failure((error as Error).message, {serviceName:"novu", ack: false})
  );

  const novuResult = await extractSafeThrowableResult(() => safeUpdateNovu);
  if(!novuResult.ok && novuResult.reason === "error") return new Failure(novuResult.message, {serviceName:"novu", ack: false});

  return new Success({serviceName:"novu", ack: true})

}

export default novuUpdateSubscriber;
