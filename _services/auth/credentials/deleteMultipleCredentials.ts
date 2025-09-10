import { deleteBulkCredentials } from "@repositories/credentials/credentialsRepo";
import { updateOutboxRecordStatus } from "@repositories/outboxRecord/outboxRecordRepo";
import getOutboxRecordOfType from "@services/_sharedServices/outboxRecordServices/getOutboxRecordOfType";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import { AnyBulkWriteOperation, startSession } from "mongoose";

// NOTE: run this using worker
async function deleteMultipleCredentials() {
 
  const outboxRecordResult = await getOutboxRecordOfType<UserDeletedEvent>("user.deleted");

  if(!outboxRecordResult.ok) return;
  const outboxRecordDoc = outboxRecordResult.result;
  const payload = outboxRecordDoc.payload as UserDeletedEvent["payload"];
  
  const session = await startSession();
  const bulkOps: Array<AnyBulkWriteOperation<CredentialsDocument>> = [
    {
      deleteMany: {
        filter: { email: { $in: payload.emailsToDelete } },
      },
    },
  ];

  await session.withTransaction(async () => {
    const bulkResult = await deleteBulkCredentials(bulkOps, session);
    const hasError = await Promise.resolve(bulkResult.hasWriteErrors());
    const errorList = await Promise.resolve(bulkResult.getWriteErrors());
    // mark outbox record as completed
    const status = hasError ? "completed" : "failed";
    await updateOutboxRecordStatus(outboxRecordDoc.id, status, session);
    // return { hasError, errorList };
  });

}

export default deleteMultipleCredentials;