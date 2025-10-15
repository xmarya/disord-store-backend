import { assignStoreToOwner } from "@repositories/storeOwner/storeOwnerRepo";
import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import { StoreCreatedEvent } from "@Types/events/StoreEvents";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { MongoId } from "@Types/Schema/MongoId";
import { startSession } from "mongoose";

async function assignStoreToOwnerConsumer(event: StoreCreatedEvent) {
  const {
    store: { owner, _id },
  } = event.payload;

  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      const updatedOwner = await assignStoreToOwner(owner, _id as MongoId, session);

      if (!updatedOwner) return updatedOwner;
      await createOutboxRecord<[UserUpdatedEvent]>(
        [
          {
            type: "user-updated",
            payload: {
              user: updatedOwner,
            },
          },
        ],
        session
      );
    });
  } catch (error) {
    return new Failure((error as Error).message, { serviceName: "storeOwners", ack: false });
  } finally {
    await session.endSession();
  }

  return new Success({ serviceName: "storeOwners", ack: true });
}

export default assignStoreToOwnerConsumer;
