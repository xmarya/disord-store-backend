import { upsertOutboxRecordInCache } from "@externals/redis/cacheControllers/outboxRecordsCache";
import { DomainEvent } from "@Types/events/DomainEvent";
import { OutboxEvent } from "@Types/events/OutboxEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function getConsumerACK<T extends OutboxEvent>(event: T, receiver: (event: T) => Promise<Success<Record<string, boolean>> | Failure>) {
  const { outboxRecordId } = event;
  const receiverResult = await receiver(event);
  if (!receiverResult.ok) {
    await upsertOutboxRecordInCache(event.type, outboxRecordId, receiverResult.DTO);
    return new Failure(receiverResult.message);
  }
  
  await upsertOutboxRecordInCache(event.type, outboxRecordId, receiverResult.result);

  return new Success(true);
}

export default getConsumerACK;
