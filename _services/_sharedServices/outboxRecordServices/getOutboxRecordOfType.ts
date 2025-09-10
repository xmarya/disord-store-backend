import { getOneOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { DomainEvent } from "@Types/events/DomainEvent";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOutboxRecordOfType<T extends DomainEvent>(type: T["type"]) {
  const safeGetOutboxRecord = safeThrowable(
    () => getOneOutboxRecord(type),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGetOutboxRecord);
}

export default getOutboxRecordOfType;
