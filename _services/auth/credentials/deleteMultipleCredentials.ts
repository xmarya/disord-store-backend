import { deleteBulkCredentials } from "@repositories/credentials/credentialsRepo";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { CredentialsDocument } from "@Types/Schema/Users/UserCredentials";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { AnyBulkWriteOperation } from "mongoose";

// NOTE: run this using worker, it's a consumer function
async function deleteMultipleCredentials(event: UserDeletedEvent) {
  const {payload} = event;
  const bulkOps: Array<AnyBulkWriteOperation<CredentialsDocument>> = [
    {
      deleteMany: {
        filter: { email: { $in: payload.emailsToDelete } },
      },
    },
  ];
  const safeBulk = safeThrowable(
    () => deleteBulkCredentials(bulkOps),
    (error) => new Failure((error as Error).message)
  );

  const bulkResult = await extractSafeThrowableResult(() => safeBulk);

  if (!bulkResult.ok) return new Failure(bulkResult.message, { credentialsCollection: false });

  return new Success({ credentialsCollection: true });
}

export default deleteMultipleCredentials;
