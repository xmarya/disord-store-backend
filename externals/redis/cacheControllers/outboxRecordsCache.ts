import { OutboxRecordsInfo } from "@Types/events/OutboxEvents";
import { upsertRedisJson, deleteRedisJson, getRedisJson } from "../redisOperations/redisJson";
import { RabbitConsumerDTO } from "@Types/ResultTypes/errors/Failure";

const CACHE_KEY = "OutboxRecords";


export async function upsertOutboxRecordInCache(eventType: string, outboxRecordId: string, data:RabbitConsumerDTO) {
  await upsertRedisJson(CACHE_KEY, "$", {}, "NX");
  // the creation is in the root ".""
  // the id MUST be initialised with an empty {} in the section

  await upsertRedisJson(CACHE_KEY, `.${eventType}`, {}, "NX");
  await upsertRedisJson(CACHE_KEY, `.${eventType}.${outboxRecordId}.${data.serviceName}`, data.ack);
}

export async function getOutboxRecordsFromCache(): Promise<OutboxRecordsInfo> {
  const result = await getRedisJson<OutboxRecordsInfo>(CACHE_KEY);
  return result;
}

export async function removeCompletedOutboxRecord(eventType: string, outboxRecordId: string) {
  return await deleteRedisJson(CACHE_KEY, `.${eventType}.${outboxRecordId}`);
}

// export async function upsertOutboxRecordInCache2(eventType: string, outboxRecordId: string, serviceName: string, data: any) {
//   const isKeyExist = await getRedisJson("newtest");
//   if (!isKeyExist) {
//     await upsertRedisJson("newtest", "$", {});
//   }

//   const isEventTypeExist = await getRedisJson("newtest", `$.${eventType}`);

//   if (!isEventTypeExist.length) {
//     console.log("insider");
//     // the creation is in the root $
//     // the id MUST be initialised with an empty {} in the section

//     await upsertRedisJson("newtest", `.${eventType}`, {});
//   }
//   await upsertRedisJson("newtest", `.${eventType}.${outboxRecordId}`, data);
// }
