import { Queue, QueueOptions, Worker } from "bullmq";
import redis from "../redis";

// get the redis instance to connect:
const connection = redis;

// create a queue name for the jobs to be queued in:
const createQueue = (queueName: string) => {
  const options: Partial<QueueOptions> = { defaultJobOptions: { removeOnComplete: true, removeOnFail: false, attempts: 10, backoff: { type: "fixed", delay: 3500 } } };
  return new Queue(queueName, { connection, ...options });
};
const createWorker = (queueName: string, processor: any) => {
  return new Worker(
    queueName,
    async (job) => {
      await processor(job.data); // the data is whatever passed when initialising/using queue.add()
    },
    { connection }
  );
};

/* OLD CODE (kept for reference): 
// create worker to process the queue:
async function createWorker(queueName:string, processor:any, options?:Partial<WorkerOptions>) {
    const worker = new Worker(queueName,
    async () => await processor(),
    {connection, ...options}
);

return worker;
}
*/

async function bullmq(queueName: string, processor: any) {
  const queue = createQueue(queueName);
  const worker = createWorker(queueName, processor);

  worker.on("ready", () => console.log(`worker for ${queueName} is ready...`));
  worker.on("progress", (job, progress) => console.log("worker is progressing the job"));
  worker.on("completed", (job, result) => console.log("A JOB HAS COMPLETED 🎉"));
  worker.on("failed", (job, error) => console.log(`${job} has failed during this error ${error.name}: ${error.message}`));
  worker.on("error", (error) => console.log("BullMQ ERROR 🔴: ", error.message));

  return { queue, worker };
}

export default bullmq;

/*
 NOTE: BullMQ queues and workers are independent
    Queue = used to add jobs
    Worker = used to process jobs
    calling new Worker(...) always creates a new worker process (internally a new event loop handler). 
    BullMQ does not share a worker instance automatically.
*/
