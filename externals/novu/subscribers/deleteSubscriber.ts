import novu from "@config/novu";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function novuDeleteSubscriber(event: UserDeletedEvent) {

  const { usersId: subscribersIds } = event.payload;
  try {
    await Promise.all(
      subscribersIds.map(async (id) => {
        await novu.subscribers.delete(id);
      })
    );

    return new Success({serviceName:"novu", ack:true});
  } catch (error) {
    if ((error as { statusCode: number }).statusCode === 404) return new Success({serviceName: "novu", ack :true});
    return new Failure((error as Error).message, {serviceName:"novu", ack:false});
  }
}


export default novuDeleteSubscriber;
