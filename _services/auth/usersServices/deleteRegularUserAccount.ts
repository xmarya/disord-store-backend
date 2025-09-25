import { deleteRegularUser } from "@repositories/user/userRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function deleteRegularUserAccount(userId: MongoId) {

    const session = await startSession();
  
    const deletedUser = await session.withTransaction(async () => {
      const deletedUser = await deleteRegularUser(userId, session);
      if (deletedUser) {
        await createOutboxRecord<[UserDeletedEvent]>([{type:"user-deleted", payload:{ usersId: [deletedUser.id], emailsToDelete: [deletedUser.email], userType: deletedUser.userType }}], session);
      }
      return deletedUser;
    });
    await session.endSession();

    if (!deletedUser) return new Failure();
  
    return new Success(deletedUser);
}

export default deleteRegularUserAccount;
