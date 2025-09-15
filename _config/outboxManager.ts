import { getOutboxRecordsFromCache } from "@externals/redis/cacheControllers/outboxRecordsCache";
import { OutboxRecordManager } from "@Types/events/OutboxRecordManager";

async function initialiseOutboxRecordsInfo() {
  return (await getOutboxRecordsFromCache()) ?? {};
}

const outboxRecordsInfo = await initialiseOutboxRecordsInfo();
const outboxManager = new OutboxRecordManager(outboxRecordsInfo);

export default outboxManager;
