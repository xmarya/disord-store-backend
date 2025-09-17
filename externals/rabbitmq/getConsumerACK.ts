import { upsertOutboxRecordInCache } from "@externals/redis/cacheControllers/outboxRecordsCache";
import { DomainEvent } from "@Types/events/DomainEvent";
import { OutboxEvent } from "@Types/events/OutboxEvents";
import { Failure, RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function getConsumerACK<T extends OutboxEvent>(event: T, receiver: (event: T) => Promise<Success<RabbitConsumerDTO> | Failure>) {
  const { outboxRecordId } = event;
  const receiverResult = await receiver(event);
  if (!receiverResult.ok) {
    console.log("✨ FALSE ACK FROM",receiverResult.DTO);
    await upsertOutboxRecordInCache(event.type, outboxRecordId, receiverResult.DTO as RabbitConsumerDTO);
    return new Failure(receiverResult.message);
  }
  
  console.log("✨ TRUE ACK FROM",receiverResult.result);
  await upsertOutboxRecordInCache(event.type, outboxRecordId, receiverResult.result);

  return new Success(true);
}

export default getConsumerACK;
