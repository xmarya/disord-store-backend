import bullmq from "@config/bullmq";
import { getOutboxRecordsFromCache, removeCompletedOutboxRecord } from "@externals/redis/cacheControllers/outboxRecordsCache";
import { deleteCompletedOutboxRecord } from "@repositories/outboxRecord/outboxRecordRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";
import {ms} from "ms";


const {queue} = await bullmq("completedOutboxRecord", completedOutboxRecordProcessor);

async function completedOutboxRecordBullMQ() {
  // STEP 1) add job to the queue:
  await queue.add("dbDeleteJob", {}, { repeat: { every: ms("30m") }, jobId: "outboxRecord-delete-job" });
}

async function completedOutboxRecordProcessor() {
  const outboxMap = await getOutboxRecordsFromCache()
  const completedRecordIds:Array<string> = [];
    Object.entries(outboxMap).forEach(([id, services]) => {
      if(Object.values(services).every(ack => ack === true)){
        const recordId = new mongoose.Types.ObjectId(id) as unknown as string;
        completedRecordIds.push(recordId);
      }
    });
  
    if(completedRecordIds.length) {
      const result = await deleteCompletedOutboxRecord(completedRecordIds);
      result.deletedCount && await removeCompletedOutboxRecord(completedRecordIds)
    }
}

export default completedOutboxRecordBullMQ;