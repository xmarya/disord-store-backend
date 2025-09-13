import { upsertRedisJson, deleteRedisJson, getRedisJson } from "../redisOperations/redisJson";

const CACHE_KEY = "OutboxRecords";


export async function upsertOutboxRecordInCache(eventType: string, outboxRecordId: string, /*serviceName: string,*/ data: any) {
  await upsertRedisJson(CACHE_KEY, "$", {}, "NX");
  // the creation is in the root ".""
  // the id MUST be initialised with an empty {} in the section

  await upsertRedisJson(CACHE_KEY, `.${eventType}`, {}, "NX");
  await upsertRedisJson(CACHE_KEY, `.${eventType}.${outboxRecordId}`, data);
}

export async function getOutboxRecordsFromCache(): Promise<any> {
  const result = await getRedisJson<any>("betterTestOutboxRecords"); /* CHANGE LATER: to  CACHE_KEY*/
  return result;
}

export async function removeCompletedOutboxRecord(eventType: string, outboxRecordId: string) {
  return await deleteRedisJson("betterTestOutboxRecords", `$.["${eventType}"].${outboxRecordId}`); /* CHANGE LATER: to  CACHE_KEY*/
}

// export async function upsertOutboxRecordInCache2(eventType: string, outboxRecordId: string, serviceName: string, data: any) {
//   const isKeyExist = await getRedisJson("newtest"); /* CHANGE LATER: to  CACHE_KEY*/
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
