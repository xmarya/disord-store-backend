import { deleteBulkCredentials } from "@repositories/credentials/credentialsRepo";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import { AnyBulkWriteOperation, startSession } from "mongoose";

// NOTE: run this using worker, it's a consumer function
async function deleteMultipleCredentials<T extends UserDeletedEvent>(payload:T["payload"]) {
 
  
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
    
    // return { hasError, errorList };
  });

}

export default deleteMultipleCredentials;