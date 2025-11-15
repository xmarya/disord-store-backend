import updateStoreStats from "@services/auth/storeServices/storeStats/updateStoreStats";
import { InvoiceCreated } from "@Types/events/InvoiceEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function updateStoreStatsConsumer(event: InvoiceCreated) {
  const { operationType, storesStats } = event.payload;
  const updateResult = await updateStoreStats(storesStats, operationType);
  if (!updateResult.ok) return new Failure(updateResult.message, { serviceName: "storeStatsCollection", ack: false });

  return new Success({ serviceName: "storeStatsCollection", ack: true });
}

export default updateStoreStatsConsumer;
