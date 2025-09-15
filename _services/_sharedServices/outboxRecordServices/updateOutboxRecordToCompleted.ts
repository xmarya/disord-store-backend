import { updateOutboxRecordStatusToCompleted } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function updateOutboxRecordToCompleted(recordId:MongoId) {
    const safeUpdateRecord = safeThrowable(
        () => updateOutboxRecordStatusToCompleted(recordId),
        (error) => new Failure((error as Error).message)
    )

    return await extractSafeThrowableResult(() => safeUpdateRecord);
} 

export default updateOutboxRecordToCompleted;