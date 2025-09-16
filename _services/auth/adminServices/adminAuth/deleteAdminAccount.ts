import Admin from "@models/adminModel";
import { deleteDoc } from "@repositories/global";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function deleteAdminAccount(adminId: MongoId) {
  const session = await startSession();

  const deletedAdmin = await session.withTransaction(async () => {
    const deletedAdmin = await deleteDoc(Admin, adminId);
    if (deletedAdmin) {
      await createOutboxRecord<UserDeletedEvent>("user-deleted", { usersId: [deletedAdmin.id], emailsToDelete: [deletedAdmin.email], userType: deletedAdmin.userType }, session);
    }
    return deletedAdmin;
  });

  if (!deletedAdmin) return new Failure();

  return new Success(deletedAdmin);
}

export default deleteAdminAccount;