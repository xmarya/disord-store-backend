import novu from "@config/novu";
import { AssistantCreatedEvent } from "@Types/events/AssistantEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

export async function novuCreateAssistantSubscriber(event: AssistantCreatedEvent) {
  const { novuSubscriber, permissions, storeId } = event.payload;
  const { id, firstName, lastName, email, userType, phoneNumber } = novuSubscriber;
  try {
    await novu.subscribers.create({
      subscriberId: id,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      data: {
        userType,
        store: storeId,
        permissions,
      },
    });

    return new Success({ serviceName: "novu", ack: true });
  } catch (error) {
    return new Failure((error as Error).message, { serviceName: "novu", ack: false });
  }
}

export default novuCreateAssistantSubscriber;
