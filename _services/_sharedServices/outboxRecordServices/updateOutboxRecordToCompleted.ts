import { updateOutboxRecordStatusToCompleted } from "@repositories/outboxRecord/outboxRecordRepo";
import { DomainEvent } from "@Types/events/DomainEvent";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function updateOutboxRecordToCompleted<T extends DomainEvent>(type:T["type"], recordId:MongoId) {
    const safeUpdateRecord = safeThrowable(
        () => updateOutboxRecordStatusToCompleted(type, recordId),
        (error) => new Failure((error as Error).message)
    )

    return await extractSafeThrowableResult(() => safeUpdateRecord);
} 

export default updateOutboxRecordToCompleted;