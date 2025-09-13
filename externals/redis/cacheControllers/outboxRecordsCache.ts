import { upsertRedisJson, deleteRedisJson, getRedisJson } from "../redisOperations/redisJson";

const CACHE_KEY = "OutboxRecords";

const formatPath = (eventType: string, outboxRecordId: string, serviceName: string) => `$.["${eventType}"].${outboxRecordId}.${serviceName}` as `$.${string}`;

export async function upsertOutboxRecordInCache(eventType: string, outboxRecordId: string, serviceName: string, data: any) {
const isKeyExist = await getRedisJson(CACHE_KEY); /* CHANGE LATER: to  CACHE_KEY*/
  if (!isKeyExist) {
    const res = await upsertRedisJson(CACHE_KEY, "$", {});
    console.log(res);
  }

  const isEventTypeExist = await getRedisJson(CACHE_KEY, `$.${eventType}`);

  if (!isEventTypeExist.length) {
    // the creation is in the root ".""
    // the id MUST be initialised with an empty {} in the section

    const res =await upsertRedisJson(CACHE_KEY, `.${eventType}`, {});
    console.log(res);
  }
  await upsertRedisJson(CACHE_KEY, `.${eventType}.${outboxRecordId}`, data);
}

export async function getOutboxRecordsFromCache(): Promise<any> {
  const result = await getRedisJson<any>("betterTestOutboxRecords"); /* CHANGE LATER: to  CACHE_KEY*/
  return result;
}

export async function removeCompletedOutboxRecord(eventType: string, outboxRecordId: string) {
  return await deleteRedisJson("betterTestOutboxRecords", `$.["${eventType}"].${outboxRecordId}`); /* CHANGE LATER: to  CACHE_KEY*/
}

export async function upsertOutboxRecordInCache2(eventType: string, outboxRecordId: string, serviceName: string, data: any) {
  const isKeyExist = await getRedisJson("newtest"); /* CHANGE LATER: to  CACHE_KEY*/
  if (!isKeyExist) {
    await upsertRedisJson("newtest", "$", {});
  }

  const isEventTypeExist = await getRedisJson("newtest", `$.${eventType}`);

  if (!isEventTypeExist.length) {
    console.log("insider");
    // the creation is in the root $
    // the id MUST be initialised with an empty {} in the section

    await upsertRedisJson("newtest", `.${eventType}`, {});
  }
  await upsertRedisJson("newtest", `.${eventType}.${outboxRecordId}`, data);
}