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

    return new Success({novu:true});
  } catch (error) {
    if ((error as { statusCode: number }).statusCode === 404) return new Success({novu:true});
    return new Failure((error as Error).message, {novu:false});
  }
}


export default novuDeleteSubscriber;
