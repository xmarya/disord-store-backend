import { OutboxRecordsInfo } from "@Types/events/OutboxEvents";
import { upsertRedisJson, deleteRedisJson, getRedisJson } from "../redisOperations/redisJson";
import { RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";

const CACHE_KEY = "OutboxRecords";

export async function upsertOutboxRecordInCache(outboxRecordId: string, data: RabbitConsumerDTO) {
  const keyCreating = await upsertRedisJson(CACHE_KEY, "$", {}, "NX");
  // the creation is in the root ".""
  // the id MUST be initialised with an empty {} in the section

  const recordCreating = await upsertRedisJson(CACHE_KEY, `.${outboxRecordId}`, {}, "NX");
  const serviceCreating = await upsertRedisJson(CACHE_KEY, `.${outboxRecordId}.${data.serviceName}`, data.ack);

  // return {keyCreating, recordCreating, serviceCreating}
}

export async function getOutboxRecordsFromCache(): Promise<OutboxRecordsInfo> {
  const result = await getRedisJson<OutboxRecordsInfo>(CACHE_KEY);
  return result;
}

export async function removeCompletedOutboxRecord(outboxRecordIds: Array<string>) {
  return await deleteRedisJson(CACHE_KEY, outboxRecordIds);
}